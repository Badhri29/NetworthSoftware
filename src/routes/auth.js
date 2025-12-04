const express = require("express");
const { hashPassword, verifyPassword } = require("../utils/password");
const { getState, commit, nextId } = require("../utils/store");
const {
  createToken,
  setAuthCookie,
  clearAuthCookie,
  requireAuth,
} = require("../middleware/auth");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const db = getState();
    const existing = db.users.find((u) => u.email === email);
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }
    const passwordHash = await hashPassword(password);
    const user = {
      id: nextId("users"),
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    commit((dbState) => {
      dbState.users.push(user);
    });
    const token = createToken({ id: user.id, email: user.email });
    setAuthCookie(res, token);
    return res.status(201).json({ user });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const db = getState();
    const user = db.users.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = createToken({ id: user.id, email: user.email });
    setAuthCookie(res, token);
    return res.json({
      user: { id: user.id, email: user.email, createdAt: user.createdAt },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  return res.json({ success: true });
});

router.post("/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Current and new passwords are required" });
    }
    const db = getState();
    const user = db.users.find((u) => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }
    const passwordHash = await hashPassword(newPassword);
    commit((dbState) => {
      const found = dbState.users.find((u) => u.id === user.id);
      if (found) {
        found.passwordHash = passwordHash;
      }
    });
    return res.json({ success: true });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const db = getState();
    const user = db.users.find((u) => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({ user });
  } catch (err) {
    console.error("Me error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;


