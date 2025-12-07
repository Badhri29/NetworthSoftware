const express = require("express");
const { hashPassword } = require("../utils/password");
const { getState, commit } = require("../utils/store");

const router = express.Router();

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

// Update profile fields (name, age, gender, phone, password)
router.post("/profile", async (req, res) => {
  try {
    const { name, age, gender, phone, password } = req.body;
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
