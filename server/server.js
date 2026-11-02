require("dotenv").config();
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const itemRoutes = require("./routes/items");
const claimRoutes = require("./routes/claims");
const adminRoutes = require("./routes/admin");

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }), authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/admin", adminRoutes);
app.use(express.static(path.join(__dirname, "../public")));

app.get("/api/health", (_req, res) => res.json({ status: "ok", app: "CampusFind" }));
app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "../public/index.html")));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(400).json({ message: err.message || "Something went wrong." });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => app.listen(PORT, () => console.log(`CampusFind running at http://localhost:${PORT}`)))
  .catch(err => { console.error("Startup failed:", err.message); process.exit(1); });
