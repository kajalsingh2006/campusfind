const express = require("express");
const User = require("../models/User");
const Item = require("../models/Item");
const Claim = require("../models/Claim");
const Category = require("../models/Category");
const { protect, adminOnly } = require("../middleware/auth");
const router = express.Router();
router.use(protect, adminOnly);

router.get("/stats", async (_req, res) => {
  const [users, lost, found, returned, pending, claims] = await Promise.all([
    User.countDocuments({ role: "user" }),
    Item.countDocuments({ type: "lost" }),
    Item.countDocuments({ type: "found" }),
    Item.countDocuments({ status: "returned" }),
    Item.countDocuments({ status: "pending" }),
    Claim.countDocuments({ status: "pending" })
  ]);
  res.json({ users, lost, found, returned, pending, claims });
});
router.get("/users", async (_req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json({ users });
});
router.delete("/users/:id", async (req, res) => {
  if (String(req.user._id) === req.params.id) return res.status(400).json({ message: "You cannot delete your own admin account." });
  await User.findOneAndDelete({ _id: req.params.id, role: "user" });
  res.json({ message: "User deleted if found." });
});
router.get("/categories", async (_req, res) => res.json({ categories: await Category.find().sort({ name: 1 }) }));
router.post("/categories", async (req, res) => {
  if (!req.body.name?.trim()) return res.status(400).json({ message: "Category name is required." });
  try { const category = await Category.create({ name: req.body.name.trim() }); res.status(201).json({ category }); }
  catch { res.status(409).json({ message: "Category already exists." }); }
});
router.delete("/categories/:id", async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: "Category deleted." });
});
module.exports = router;
