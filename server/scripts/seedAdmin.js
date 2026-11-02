require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Category = require("../models/Category");

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const email = (process.env.ADMIN_EMAIL || "admin@campusfind.local").toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
    const hash = await bcrypt.hash(password, 12);
    await User.findOneAndUpdate(
      { email },
      { name: process.env.ADMIN_NAME || "CampusFind Administrator", email, password: hash, role: "admin" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    const names = ["Books", "ID Cards", "Bags", "Electronics", "Stationery", "Keys", "Accessories", "Other"];
    for (const name of names) await Category.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true });
    console.log("Admin account and default categories are ready.");
    console.log("Admin email:", email);
    console.log("Admin password:", password);
  } catch (err) { console.error(err); process.exitCode = 1; }
  finally { await mongoose.disconnect(); }
})();
