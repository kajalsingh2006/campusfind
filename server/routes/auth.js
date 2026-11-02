const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const router = express.Router();

function makeToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}
function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role };
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required." });
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters." });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "An account with this email already exists." });
    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hash, phone, role: "user" });
    res.status(201).json({ token: makeToken(user), user: publicUser(user) });
  } catch (err) { res.status(500).json({ message: "Could not create account." }); }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() }).select("+password");
    if (!user || !(await bcrypt.compare(password || "", user.password)))
      return res.status(401).json({ message: "Invalid email or password." });
    res.json({ token: makeToken(user), user: publicUser(user) });
  } catch { res.status(500).json({ message: "Login failed." }); }
});

router.get("/me", protect, (req, res) => res.json({ user: publicUser(req.user) }));

router.put("/me", protect, async (req, res) => {
  const { name, phone } = req.body;
  if (name) req.user.name = name;
  req.user.phone = phone || "";
  await req.user.save();
  res.json({ user: publicUser(req.user) });
});

module.exports = router;
