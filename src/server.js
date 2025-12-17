const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");

const { PORT, ROOT_DIR } = require("./config/env");
const { attachUserIfPresent, requireAuth } = require("./middleware/auth");

// Routes
const authRoutes = require("./routes/auth");
const categoriesRoutes = require("./routes/categories");
const transactionsRoutes = require("./routes/transactions.js");
const assetsRoutes = require("./routes/assets");
const dashboardRoutes = require("./routes/dashboard");
const profileRoutes = require("./routes/profile");

const app = express();

/* =======================
   GLOBAL MIDDLEWARE
======================= */
app.use(helmet());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(attachUserIfPresent);

/* =======================
   STATIC FILES
======================= */
const publicDir = path.join(ROOT_DIR, "public");
app.use(express.static(publicDir));

/* =======================
   PUBLIC API
======================= */
app.use("/api/auth", authRoutes);

/* =======================
   PROTECTED API (AUTH REQUIRED)
======================= */
app.use("/api", requireAuth);

app.use("/api/categories", categoriesRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/assets", assetsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);

/* =======================
   FRONTEND FALLBACK
======================= */
app.get("*", (req, res) => {
  if (req.user) {
    return res.sendFile(path.join(publicDir, "dashboard.html"));
  }
  return res.sendFile(path.join(publicDir, "index.html"));
});

/* =======================
   ERROR HANDLER
======================= */
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

/* =======================
   SERVER START
======================= */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
