const mongoose = require("mongoose");
const itemSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["lost", "found"], required: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  category: { type: String, required: true, trim: true },
  description: { type: String, required: true, maxlength: 1500 },
  location: { type: String, required: true, maxlength: 150 },
  date: { type: Date, required: true },
  image: { type: String, default: "" },
  status: { type: String, enum: ["pending", "approved", "claim-pending", "returned", "rejected"], default: "pending" },
  adminNote: { type: String, default: "" }
}, { timestamps: true });
itemSchema.index({ name: "text", description: "text", category: "text", location: "text" });
module.exports = mongoose.model("Item", itemSchema);
