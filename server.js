const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const Product = require("./models/Product");
const User = require("./models/User");

const app = express();
app.use(express.json());
app.use(cors());

// ===== Multer =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "public", "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname.replace(/\s/g, "_") + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ===== Schemas =====
const reviewSchema = new mongoose.Schema({
  productId: Number,
  name: String,
  rating: Number,
  text: String,
  date: String
});
const Review = mongoose.model("Review", reviewSchema);

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  customerName: String,
  phone: String,
  address: String,
  payment: String,
  paymentStatus: { type: String, default: "pending" }, // pending / paid / failed
  items: Array,
  total: Number,
  shipping: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  couponCode: String,
  status: { type: String, default: "new" }, // new / processing / shipped / delivered / cancelled
  notes: String,
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model("Order", orderSchema);

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: String, required: true },
  icon: { type: String, default: "🛍️" },
  order: { type: Number, default: 0 }
});
const Category = mongoose.model("Category", categorySchema);

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  type: { type: String, default: "percent" }, // percent / fixed
  value: { type: Number, required: true },
  minOrder: { type: Number, default: 0 },
  maxUses: { type: Number, default: 100 },
  usedCount: { type: Number, default: 0 },
  expiresAt: { type: Date },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const Coupon = mongoose.model("Coupon", couponSchema);

const settingsSchema = new mongoose.Schema({
  storeName: { type: String, default: "Zayro Store" },
  logo: { type: String, default: "" },
  currency: { type: String, default: "USD" },
  shippingPrice: { type: Number, default: 0 },
  freeShippingMin: { type: Number, default: 0 },
  email: { type: String, default: "" },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  facebook: { type: String, default: "" },
  instagram: { type: String, default: "" },
  twitter: { type: String, default: "" },
});
const Settings = mongoose.model("Settings", settingsSchema);

// ===== Middlewares =====
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.json({ message: "No token ❌" });
  try {
    const decoded = jwt.verify(token, "secretkey");
    req.userId = decoded.id;
    next();
  } catch {
    res.json({ message: "Invalid token ❌" });
  }
}

async function adminMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token ❌" });
  try {
    const decoded = jwt.verify(token, "secretkey");
    const user = await User.findById(decoded.id);
    if (!user || !user.isAdmin) return res.status(403).json({ message: "Not admin ❌" });
    req.userId = decoded.id;
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token ❌" });
  }
}

// ===== DB Connect =====
mongoose.connect("mongodb://mohammadreyad:123456Aa@ac-jkk4roe-shard-00-00.xsnskpq.mongodb.net:27017,ac-jkk4roe-shard-00-01.xsnskpq.mongodb.net:27017,ac-jkk4roe-shard-00-02.xsnskpq.mongodb.net:27017/?ssl=true&replicaSet=atlas-685s4r-shard-0&authSource=admin&appName=Cluster0")
  .then(async () => {
    console.log("Connected to MongoDB 🔥");
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      await Category.insertMany([
        { name: "الكل", value: "all", icon: "🛍️", order: 0 },
        { name: "إلكترونيات", value: "electronics", icon: "💻", order: 1 },
        { name: "موبايلات", value: "mobiles", icon: "📱", order: 2 },
        { name: "أجهزة منزلية", value: "appliances", icon: "🏠", order: 3 },
        { name: "أحذية", value: "fashion", icon: "👟", order: 4 },
        { name: "اكسسوار", value: "accessories", icon: "⌚", order: 5 },
        { name: "حقائب", value: "bags", icon: "👜", order: 6 },
        { name: "رياضة", value: "sports", icon: "⚽", order: 7 },
        { name: "هدايا", value: "toys", icon: "🎮", order: 8 },
        { name: "سيارات", value: "cars", icon: "🚗", order: 9 },
      ]);
    }
    const setCount = await Settings.countDocuments();
    if (setCount === 0) await new Settings({}).save();
  })
  .catch(err => console.log(err));

// ================= AUTH =================
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.json({ message: "Email already exists ❌" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.json({ message: "User created" });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { input, password } = req.body;
    const user = await User.findOne({ $or: [{ username: input }, { email: input }] });
    if (!user) return res.json({ message: "User not found ❌" });
    if (user.banned) return res.json({ message: "Account banned ❌" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ message: "Wrong password ❌" });
    const token = jwt.sign({ id: user._id }, "secretkey");
    res.json({ token, username: user.username, avatar: user.avatar || "", isAdmin: user.isAdmin });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

// ================= PROFILE =================
app.get("/api/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json(user);
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

app.put("/api/profile", authMiddleware, async (req, res) => {
  try {
    const { username, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(req.userId, { username, phone, address }, { new: true }).select("-password");
    res.json({ message: "Profile updated ✅", user });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

app.post("/api/upload-avatar", authMiddleware, upload.single("avatar"), async (req, res) => {
  try {
    const avatarUrl = "/uploads/" + req.file.filename;
    await User.findByIdAndUpdate(req.userId, { avatar: avatarUrl });
    res.json({ message: "Avatar updated ✅", avatar: avatarUrl });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

// ================= PRODUCTS =================
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find({ status: "available" });
    res.json(products);
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

// ================= CATEGORIES =================
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    res.json(categories);
  } catch (error) {
    res.json([]);
  }
});

// ================= REVIEWS =================
app.get("/api/reviews/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ productId: parseInt(req.params.productId) }).sort({ _id: -1 });
    res.json(reviews);
  } catch (error) {
    res.json([]);
  }
});

app.post("/api/reviews/:productId", async (req, res) => {
  try {
    const { name, rating, text } = req.body;
    if (!name || !rating || !text) return res.json({ message: "Missing fields ❌" });
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const review = new Review({ productId: parseInt(req.params.productId), name, rating, text, date });
    await review.save();
    res.json({ message: "Review added ✅" });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

// ================= COUPON CHECK =================
app.post("/api/check-coupon", async (req, res) => {
  try {
    const { code, total } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
    if (!coupon) return res.json({ valid: false, message: "كود غير صحيح ❌" });
    if (coupon.expiresAt && new Date() > coupon.expiresAt) return res.json({ valid: false, message: "انتهى الكود ❌" });
    if (coupon.usedCount >= coupon.maxUses) return res.json({ valid: false, message: "تجاوز الحد الأقصى ❌" });
    if (total < coupon.minOrder) return res.json({ valid: false, message: `الحد الأدنى للطلب $${coupon.minOrder} ❌` });
    const discount = coupon.type === "percent" ? (total * coupon.value / 100) : coupon.value;
    res.json({ valid: true, discount, type: coupon.type, value: coupon.value, message: "✅ تم تطبيق الكوبون" });
  } catch (error) {
    res.json({ valid: false, message: "Error ❌" });
  }
});

// ================= ORDERS =================
app.post("/api/orders", async (req, res) => {
  try {
    const { customerName, phone, address, payment, items, total, userId, couponCode, discount, shipping } = req.body;
    const orderNumber = "ZY" + Date.now().toString().slice(-6);
    const order = new Order({ orderNumber, customerName, phone, address, payment, items, total, userId: userId || null, couponCode, discount: discount || 0, shipping: shipping || 0 });
    await order.save();
    if (couponCode) await Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { usedCount: 1 } });
    res.json({ message: "Order saved ✅", orderId: order._id, orderNumber });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

// ================= SETTINGS (public) =================
app.get("/api/settings", async (req, res) => {
  try {
    const settings = await Settings.findOne();
    res.json(settings);
  } catch (error) {
    res.json({});
  }
});

// ================= ADMIN APIs =================

// Dashboard Stats
app.get("/api/admin/stats", adminMiddleware, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalReviews = await Review.countDocuments();
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayOrders = await Order.countDocuments({ createdAt: { $gte: todayStart } });
    const todayRevenue = (await Order.find({ createdAt: { $gte: todayStart } })).reduce((s, o) => s + (o.total || 0), 0);
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(8);

    // مبيعات آخر 7 أيام
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      const d2 = new Date(d); d2.setHours(23,59,59,999);
      const dayOrders = await Order.find({ createdAt: { $gte: d, $lte: d2 } });
      last7.push({ date: d.toLocaleDateString('ar', { weekday: 'short' }), revenue: dayOrders.reduce((s, o) => s + (o.total || 0), 0), count: dayOrders.length });
    }

    // أكثر المنتجات مبيعاً
    const topProducts = await Product.find().sort({ sold: -1 }).limit(5);

    res.json({ totalOrders, totalUsers, totalProducts, totalReviews, totalRevenue, todayOrders, todayRevenue, recentOrders, last7, topProducts });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

// Orders
app.get("/api/admin/orders", adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.json([]);
  }
});

app.get("/api/admin/orders/:id", adminMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    res.json(order);
  } catch (error) {
    res.json({});
  }
});

app.put("/api/admin/orders/:id", adminMiddleware, async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Updated ✅" });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

app.delete("/api/admin/orders/:id", adminMiddleware, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted ✅" });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

// Products
app.get("/api/admin/products", adminMiddleware, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.json([]);
  }
});

app.post("/api/admin/products", adminMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const { title, price, old_price, category, description, stock, status } = req.body;
    const images = req.files ? req.files.map(f => "/uploads/" + f.filename) : [];
    const image = images[0] || "";
    const product = new Product({ title, price, old_price, category, description, stock: stock || 0, status: status || "available", image, images });
    await product.save();
    res.json({ message: "Product added ✅", product });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

app.put("/api/admin/products/:id", adminMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const { title, price, old_price, category, description, stock, status } = req.body;
    const updateData = { title, price, old_price, category, description, stock, status };
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(f => "/uploads/" + f.filename);
      updateData.image = updateData.images[0];
    }
    await Product.findByIdAndUpdate(req.params.id, updateData);
    res.json({ message: "Updated ✅" });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

app.delete("/api/admin/products/:id", adminMiddleware, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted ✅" });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

// Users
app.get("/api/admin/users", adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    const usersWithOrders = await Promise.all(users.map(async u => {
      const orderCount = await Order.countDocuments({ userId: u._id });
      return { ...u.toObject(), orderCount };
    }));
    res.json(usersWithOrders);
  } catch (error) {
    res.json([]);
  }
});

app.put("/api/admin/users/:id/toggle-admin", adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isAdmin = !user.isAdmin;
    await user.save();
    res.json({ message: "Updated ✅", isAdmin: user.isAdmin });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

app.put("/api/admin/users/:id/toggle-ban", adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.banned = !user.banned;
    await user.save();
    res.json({ message: "Updated ✅", banned: user.banned });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

app.delete("/api/admin/users/:id", adminMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted ✅" });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

// Reviews
app.get("/api/admin/reviews", adminMiddleware, async (req, res) => {
  try {
    const reviews = await Review.find().sort({ _id: -1 });
    res.json(reviews);
  } catch (error) {
    res.json([]);
  }
});

app.delete("/api/admin/reviews/:id", adminMiddleware, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted ✅" });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

// Categories
app.get("/api/admin/categories", adminMiddleware, async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    res.json(categories);
  } catch (error) {
    res.json([]);
  }
});

app.post("/api/admin/categories", adminMiddleware, async (req, res) => {
  try {
    const { name, value, icon } = req.body;
    if (!name || !value) return res.json({ message: "Name and value required ❌" });
    const count = await Category.countDocuments();
    const category = new Category({ name, value, icon: icon || "🛍️", order: count });
    await category.save();
    res.json({ message: "Category added ✅", category });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

app.put("/api/admin/categories/:id", adminMiddleware, async (req, res) => {
  try {
    await Category.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Updated ✅" });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

app.delete("/api/admin/categories/:id", adminMiddleware, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted ✅" });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

// Coupons
app.get("/api/admin/coupons", adminMiddleware, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.json([]);
  }
});

app.post("/api/admin/coupons", adminMiddleware, async (req, res) => {
  try {
    const { code, type, value, minOrder, maxUses, expiresAt } = req.body;
    const coupon = new Coupon({ code: code.toUpperCase(), type, value, minOrder, maxUses, expiresAt: expiresAt || null });
    await coupon.save();
    res.json({ message: "Coupon added ✅", coupon });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

app.put("/api/admin/coupons/:id", adminMiddleware, async (req, res) => {
  try {
    await Coupon.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Updated ✅" });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

app.delete("/api/admin/coupons/:id", adminMiddleware, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted ✅" });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

// Settings
app.get("/api/admin/settings", adminMiddleware, async (req, res) => {
  try {
    const settings = await Settings.findOne();
    res.json(settings);
  } catch (error) {
    res.json({});
  }
});

app.put("/api/admin/settings", adminMiddleware, upload.single("logo"), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.logo = "/uploads/" + req.file.filename;
    await Settings.findOneAndUpdate({}, updateData, { upsert: true });
    res.json({ message: "Settings updated ✅" });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

// Analytics
app.get("/api/admin/analytics", adminMiddleware, async (req, res) => {
  try {
    const { period = "month" } = req.query;
    const days = period === "week" ? 7 : period === "year" ? 365 : 30;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      const d2 = new Date(d); d2.setHours(23,59,59,999);
      const dayOrders = await Order.find({ createdAt: { $gte: d, $lte: d2 } });
      data.push({
        date: d.toLocaleDateString('ar', { month: 'short', day: 'numeric' }),
        revenue: dayOrders.reduce((s, o) => s + (o.total || 0), 0),
        orders: dayOrders.length
      });
    }
    const topProducts = await Product.find().sort({ sold: -1 }).limit(10);
    res.json({ data, topProducts });
  } catch (error) {
    res.json({ data: [], topProducts: [] });
  }
});

// Make admin
app.post("/api/make-admin", async (req, res) => {
  try {
    const { email, secret } = req.body;
    if (secret !== "zayro_admin_2024") return res.json({ message: "Wrong secret ❌" });
    const user = await User.findOneAndUpdate({ email }, { isAdmin: true }, { new: true });
    if (!user) return res.json({ message: "User not found ❌" });
    res.json({ message: `${user.username} is now admin ✅` });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

// ================= STATIC =================
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "shoop", "index.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "public", "login", "index.html")));
app.get("/signup", (req, res) => res.sendFile(path.join(__dirname, "public", "signup", "index.html")));
app.get("/profile-page", (req, res) => res.sendFile(path.join(__dirname, "public", "profile", "index.html")));
app.get("/admin", (req, res) => res.sendFile(path.join(__dirname, "public", "admin", "index.html")));

app.listen(3000, () => console.log("Server running on port 3000 🔥"));
