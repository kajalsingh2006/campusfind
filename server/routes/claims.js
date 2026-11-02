const express = require("express");
const Claim = require("../models/Claim");
const Item = require("../models/Item");
const { protect, adminOnly } = require("../middleware/auth");
const router = express.Router();

router.get("/mine", protect, async (req, res) => {
  const claims = await Claim.find({ claimant: req.user._id }).populate({ path: "item", select: "name type image status location" }).sort({ createdAt: -1 });
  res.json({ claims });
});

router.get("/admin/all", protect, adminOnly, async (_req, res) => {
  const claims = await Claim.find().populate("claimant", "name email phone").populate("item", "name type image owner").sort({ createdAt: -1 });
  res.json({ claims });
});

router.put("/:id", protect, adminOnly, async (req, res) => {
  const { status, note } = req.body;
  if (!["approved", "rejected"].includes(status)) return res.status(400).json({ message: "Invalid claim status." });
  const claim = await Claim.findByIdAndUpdate(req.params.id, { status, adminNote: note || "" }, { new: true }).populate("item");
  if (!claim) return res.status(404).json({ message: "Claim not found." });
  if (status === "approved") await Item.findByIdAndUpdate(claim.item._id, { status: "returned" });
  else await Item.findByIdAndUpdate(claim.item._id, { status: "approved" });
  res.json({ claim, message: "Claim updated." });
});

module.exports = router;
