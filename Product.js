const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, default: "" },
  images: [{ type: String }],
  price: { type: Number, required: true },
  old_price: { type: Number },
  category: { type: String, default: "" },
  description: { type: String, default: "" },
  stock: { type: Number, default: 0 },
  status: { type: String, default: "available" }, // available / unavailable
  sold: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Product", productSchema);
