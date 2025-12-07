const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");

const { PORT, ROOT_DIR } = require("./config/env");
const { attachUserIfPresent, requireAuth } = require("./middleware/auth");

const authRoutes = require("./routes/auth");
const categoriesRoutes = require("./routes/categories");
const transactionsRoutes = require("./routes/transactions");
const assetsRoutes = require("./routes/assets");
const dashboardRoutes = require("./routes/dashboard");
const profileRoutes = require("./routes/profile");

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(attachUserIfPresent);

// Static frontend
const publicDir = path.join(ROOT_DIR, "public");
app.use(express.static(publicDir));

// API routes
app.use("/api/auth", authRoutes);

// Protected API routes
app.use("/api", requireAuth);
app.use("/api", categoriesRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api", assetsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api", profileRoutes);

// Fallback to dashboard for authenticated users, else index (login)
app.get("*", (req, res) => {
  if (req.user) {
    return res.sendFile(path.join(publicDir, "dashboard.html"));
  }
  return res.sendFile(path.join(publicDir, "index.html"));
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


