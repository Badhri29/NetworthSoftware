const express = require("express");
const path = require("path");
const fs = require("fs");
let multer;
let MULTER_AVAILABLE = true;
try {
  multer = require("multer");
} catch (e) {
  MULTER_AVAILABLE = false;
  console.warn("Optional dependency 'multer' is not installed. Photo uploads will be disabled.");
}
const { hashPassword } = require("../utils/password");
const { getState, commit } = require("../utils/store");
const { ROOT_DIR } = require("../config/env");

const router = express.Router();

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
  // Provide a noop-style API so calls like upload.single() won't crash,
  // but the returned middleware will respond with an informative error.
  upload = {
    single: () => (req, res) => res.status(501).json({ error: "File upload unavailable: 'multer' is not installed on the server." }),
  };
}

// Get current user's public profile
router.get("/profile", (req, res) => {
  try {
    const db = getState();
    const user = db.users.find((u) => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { passwordHash, ...publicUser } = user;
    return res.json({ user: publicUser });
  } catch (err) {
    console.error("Profile GET error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Upload profile photo using multipart/form-data. Field name: `photo`
router.post(
  "/profile/photo",
  (req, res, next) => {
    // call multer middleware and handle its errors explicitly
    upload.single("photo")(req, res, function (err) {
      if (err) {
        // Multer errors have a `code`
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({ error: "Photo exceeds maximum allowed size of 20MB" });
        }
        console.error("Multer upload error:", err);
        return res.status(400).json({ error: err.message || "File upload error" });
      }
      next();
    });
  },
  (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      const db = getState();
      const user = db.users.find((u) => u.id === req.user.id);
      if (!user) return res.status(404).json({ error: "User not found" });

      const urlPath = "/uploads/" + req.file.filename;
      commit((dbState) => {
        const found = dbState.users.find((u) => u.id === user.id);
        if (found) found.photo = urlPath;
      });

      return res.json({ url: urlPath });
    } catch (err) {
      console.error("Photo upload error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Update profile fields (name, age, gender, phone, password, photo)
router.post("/profile", async (req, res) => {
  try {
    const { name, age, gender, phone, password, photo } = req.body;
    const db = getState();
    const user = db.users.find((u) => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Validate simple fields
    commit((dbState) => {
      const found = dbState.users.find((u) => u.id === user.id);
      if (!found) return;
      if (typeof name === "string") found.name = name;
      if (age !== undefined && age !== null && age !== "") found.age = Number(age);
      if (typeof gender === "string") found.gender = gender;
      if (typeof phone === "string") found.phone = phone;
    });

    // Save photo data URL if provided (client sends base64 data URL)
    if (photo && typeof photo === "string") {
      // Basic size check: estimate decoded bytes from base64 length
      try {
        const prefixIndex = photo.indexOf(',');
        const b64 = prefixIndex >= 0 ? photo.slice(prefixIndex + 1) : photo;
        // estimated bytes
        const estimatedBytes = Math.ceil((b64.length * 3) / 4);
        const MAX_BYTES = 10 * 1024 * 1024; // 10MB
        if (estimatedBytes > MAX_BYTES) {
          return res.status(413).json({ error: 'Photo exceeds maximum allowed size of 20MB' });
        }
      } catch (e) {
        return res.status(400).json({ error: 'Invalid photo data' });
      }

      commit((dbState) => {
        const found = dbState.users.find((u) => u.id === user.id);
        if (found) found.photo = photo;
      });
    }

    if (password) {
      const passwordHash = await hashPassword(password);
      commit((dbState) => {
        const found = dbState.users.find((u) => u.id === user.id);
        if (found) found.passwordHash = passwordHash;
      });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Profile POST error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
