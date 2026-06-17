const mongoose = require('mongoose');

// 1. المخطط (Schema) يجب أن يُعرّف أولاً
const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  old_price: { type: Number },
  category: { type: String },
  description: { type: String },
  reviews: [{
    name: String,
    rating: Number,
    text: String,
    date: String
  }]
});

// 2. التصدير (Export) يكون دائماً في نهاية الملف بعد قراءة المخطط
module.exports = mongoose.model("Product", productSchema);