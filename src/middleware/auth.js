const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");

const AUTH_COOKIE = "nw_auth";

/**
 * Attach user if token exists (non-blocking)
 * Used globally in server.js
 */
function attachUserIfPresent(req, res, next) {
  const token = req.cookies[AUTH_COOKIE];
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email
    };
  } catch (err) {
    console.error("Invalid JWT (attachUserIfPresent):", err.message);
    res.clearCookie(AUTH_COOKIE);
  }

  next();
}

/**
 * Require authentication (blocking)
 * Used for protected routes
 */
function requireAuth(req, res, next) {
  const token = req.cookies[AUTH_COOKIE];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email
    };

    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired session"
    });
  }
}

/**
 * Helpers for login/logout
 */
function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE);
}

module.exports = {
  AUTH_COOKIE,
  attachUserIfPresent,
  requireAuth,
  createToken,
  setAuthCookie,
  clearAuthCookie
};
