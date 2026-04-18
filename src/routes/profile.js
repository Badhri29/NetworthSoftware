const express = require("express");
const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
let multer;
let MULTER_AVAILABLE = true;
try {
  multer = require("multer");
} catch (e) {
  MULTER_AVAILABLE = false;
  console.warn("Optional dependency 'multer' is not installed. Photo uploads will be disabled.");
}
const { hashPassword } = require("../utils/password");
const { ROOT_DIR } = require("../config/env");

const router = express.Router();
const prisma = new PrismaClient();

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(ROOT_DIR, "public", "uploads");
try {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
} catch (e) {
  // ignore
}

// Multer setup (optional)
let upload = null;
if (MULTER_AVAILABLE) {
  const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
      cb(null, UPLOAD_DIR);
    },
    filename: function (_req, file, cb) {
      const safe = Date.now() + "-" + file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
      cb(null, safe);
    },
  });
  upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
} else {
  upload = {
    single: () => (req, res) => res.status(501).json({ error: "File upload unavailable: 'multer' is not installed on the server." }),
  };
}

/* GET PROFILE */
router.get("/", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        gender: true,
        phone: true,
        photo: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user });
  } catch (err) {
    console.error("Profile GET error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/* UPLOAD PROFILE PHOTO */
router.post(
  "/photo",
  (req, res, next) => {
    upload.single("photo")(req, res, function (err) {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({ error: "Photo exceeds maximum allowed size of 10MB" });
        }
        console.error("Multer upload error:", err);
        return res.status(400).json({ error: err.message || "File upload error" });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const urlPath = "/uploads/" + req.file.filename;

      // Update user photo in database
      await prisma.user.update({
        where: { id: req.user.id },
        data: { photo: urlPath }
      });

      return res.json({ url: urlPath });
    } catch (err) {
      console.error("Photo upload error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

/* UPDATE PROFILE */
router.post("/", async (req, res) => {
  try {
    const { name, age, gender, phone, password } = req.body;

    // Build update data object
    const updateData = {};
    if (typeof name === "string") updateData.name = name;
    if (age !== undefined && age !== null && age !== "") updateData.age = Number(age);
    if (typeof gender === "string") updateData.gender = gender;
    if (typeof phone === "string") updateData.phone = phone;

    // Handle password if provided
    if (password) {
      updateData.password = await hashPassword(password);
    }

    // Update user in database
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        gender: true,
        phone: true,
        photo: true,
        createdAt: true
      }
    });

    return res.json({ user });
  } catch (err) {
    console.error("Profile POST error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
