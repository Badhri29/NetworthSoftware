const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");

const AUTH_COOKIE = "nw_auth";

function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // set true behind HTTPS in production
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE);
}

function requireAuth(req, res, next) {
  const token = req.cookies[AUTH_COOKIE];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function attachUserIfPresent(req, _res, next) {
  const token = req.cookies[AUTH_COOKIE];
  if (!token) {
    return next();
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email };
  } catch (err) {
    // ignore invalid token
  }
  next();
}

module.exports = {
  AUTH_COOKIE,
  createToken,
  setAuthCookie,
  clearAuthCookie,
  requireAuth,
  attachUserIfPresent,
};


