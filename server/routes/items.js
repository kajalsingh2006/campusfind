const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Item = require("../models/Item");
const Claim = require("../models/Claim");
const { protect, adminOnly } = require("../middleware/auth");
const router = express.Router();

const uploadDir = path.join(__dirname, "../../public/uploads");
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, Date.now() + "-" + Math.round(Math.random()*1e9) + path.extname(file.originalname).toLowerCase())
});
const upload = multer({
  storage,
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPG, PNG, WEBP or GIF images are allowed."));
  }
});

router.get("/", async (req, res) => {
  const filter = { status: "approved" };
  if (req.query.type && ["lost", "found"].includes(req.query.type)) filter.type = req.query.type;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.q) filter.$text = { $search: req.query.q };
  const items = await Item.find(filter).populate("owner", "name").sort({ createdAt: -1 }).limit(100);
  res.json({ items });
});

router.get("/mine", protect, async (req, res) => {
  const items = await Item.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json({ items });
});

router.post("/", protect, upload.single("image"), async (req, res) => {
  const { type, name, category, description, location, date } = req.body;
  if (!["lost", "found"].includes(type) || !name || !category || !description || !location || !date)
    return res.status(400).json({ message: "Please complete all required fields." });
  const item = await Item.create({
    owner: req.user._id, type, name, category, description, location, date,
    image: req.file ? "/uploads/" + req.file.filename : ""
  });
  res.status(201).json({ item, message: "Report submitted. It will appear publicly after admin approval." });
});

router.get("/:id", async (req, res) => {
  const item = await Item.findById(req.params.id).populate("owner", "name");
  if (!item || (item.status !== "approved" && (!req.user || String(item.owner._id) !== String(req.user._id))))
    return res.status(404).json({ message: "Item not found." });
  res.json({ item });
});

router.post("/:id/claim", protect, async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item || item.status !== "approved") return res.status(404).json({ message: "Item is not available for claims." });
  if (String(item.owner) === String(req.user._id)) return res.status(400).json({ message: "You cannot claim your own report." });
  if (!req.body.message?.trim()) return res.status(400).json({ message: "Explain how you can identify this item." });
  try {
    const claim = await Claim.create({ item: item._id, claimant: req.user._id, message: req.body.message.trim() });
    item.status = "claim-pending";
    await item.save();
    res.status(201).json({ claim, message: "Claim submitted for admin review." });
  } catch { res.status(409).json({ message: "You have already submitted a claim for this item." }); }
});

router.put("/:id", protect, async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found." });
  if (String(item.owner) !== String(req.user._id) && req.user.role !== "admin") return res.status(403).json({ message: "Not allowed." });
  const allowed = ["name", "category", "description", "location", "date", "status"];
  allowed.forEach(k => { if (req.body[k] !== undefined) item[k] = req.body[k]; });
  await item.save();
  res.json({ item, message: "Report updated." });
});

router.delete("/:id", protect, async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found." });
  if (String(item.owner) !== String(req.user._id) && req.user.role !== "admin") return res.status(403).json({ message: "Not allowed." });
  await Claim.deleteMany({ item: item._id });
  await item.deleteOne();
  res.json({ message: "Report deleted." });
});

router.post("/:id/approve", protect, adminOnly, async (req, res) => {
  const item = await Item.findByIdAndUpdate(req.params.id, { status: "approved" }, { new: true });
  if (!item) return res.status(404).json({ message: "Item not found." });
  res.json({ item, message: "Report approved." });
});

router.post("/:id/reject", protect, adminOnly, async (req, res) => {
  const item = await Item.findByIdAndUpdate(req.params.id, { status: "rejected", adminNote: req.body.note || "" }, { new: true });
  if (!item) return res.status(404).json({ message: "Item not found." });
  res.json({ item, message: "Report rejected." });
});

router.get("/admin/all", protect, adminOnly, async (_req, res) => {
  const items = await Item.find().populate("owner", "name email").sort({ createdAt: -1 });
  res.json({ items });
});

module.exports = router;
