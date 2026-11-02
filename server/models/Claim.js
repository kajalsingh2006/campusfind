const mongoose = require("mongoose");
const claimSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  claimant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true, maxlength: 1000 },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  adminNote: { type: String, default: "" }
}, { timestamps: true });
claimSchema.index({ item: 1, claimant: 1 }, { unique: true });
module.exports = mongoose.model("Claim", claimSchema);
