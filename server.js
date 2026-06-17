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
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ===== Review Schema =====
const reviewSchema = new mongoose.Schema({
  productId: Number,
  name: String,
  rating: Number,
  text: String,
  date: String
});
const Review = mongoose.model("Review", reviewSchema);

// ===== Order Schema =====
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  customerName: String,
  phone: String,
  address: String,
  payment: String,
  items: Array,
  total: Number,
  status: { type: String, default: "Processing" },
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model("Order", orderSchema);

// ===== Auth Middleware =====
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

// ===== Admin Middleware =====
async function adminMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token ❌" });
  try {
    const decoded = jwt.verify(token, "secretkey");
    const user = await User.findById(decoded.id);
    if (!user || !user.isAdmin) return res.status(403).json({ message: "Not admin ❌" });
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token ❌" });
  }
}

mongoose.connect("mongodb://mohammadreyad:123456Aa@ac-jkk4roe-shard-00-00.xsnskpq.mongodb.net:27017,ac-jkk4roe-shard-00-01.xsnskpq.mongodb.net:27017,ac-jkk4roe-shard-00-02.xsnskpq.mongodb.net:27017/?ssl=true&replicaSet=atlas-685s4r-shard-0&authSource=admin&appName=Cluster0")
  .then(() => console.log("Connected to MongoDB 🔥"))
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
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.json({ message: "Error ❌", error });
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

// ================= ORDERS =================
app.post("/api/orders", async (req, res) => {
  try {
    const { customerName, phone, address, payment, items, total, userId } = req.body;
    const order = new Order({ customerName, phone, address, payment, items, total, userId: userId || null });
    await order.save();
    res.json({ message: "Order saved ✅", orderId: order._id });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

// ================= ADMIN APIs =================

// Dashboard stats
app.get("/api/admin/stats", adminMiddleware, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalProducts = await Review.distinct("productId").then(ids => ids.length);
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
    res.json({ totalOrders, totalUsers, totalRevenue, recentOrders });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

// Get all orders
app.get("/api/admin/orders", adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.json([]);
  }
});

// Update order status
app.put("/api/admin/orders/:id", adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    await Order.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: "Status updated ✅" });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

// Delete order
app.delete("/api/admin/orders/:id", adminMiddleware, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted ✅" });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

// Get all users
app.get("/api/admin/users", adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.json([]);
  }
});

// Toggle admin
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

// Delete user
app.delete("/api/admin/users/:id", adminMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted ✅" });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

// Get all reviews
app.get("/api/admin/reviews", adminMiddleware, async (req, res) => {
  try {
    const reviews = await Review.find().sort({ _id: -1 });
    res.json(reviews);
  } catch (error) {
    res.json([]);
  }
});

// Delete review
app.delete("/api/admin/reviews/:id", adminMiddleware, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Review deleted ✅" });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

// Add product (admin)
app.post("/api/admin/products", adminMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { title, price, old_price, category, description } = req.body;
    const image = req.file ? "/uploads/" + req.file.filename : "";
    const product = new Product({ title, price, old_price, category, description, image });
    await product.save();
    res.json({ message: "Product added ✅", product });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

// Delete product (admin)
app.delete("/api/admin/products/:id", adminMiddleware, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted ✅" });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

// Update product (admin)
app.put("/api/admin/products/:id", adminMiddleware, async (req, res) => {
  try {
    const { title, price, old_price, category, description } = req.body;
    await Product.findByIdAndUpdate(req.params.id, { title, price, old_price, category, description });
    res.json({ message: "Product updated ✅" });
  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});

// Make first admin (one time use)
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

// ================= PAGES =================
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "shoop", "index.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "public", "login", "index.html")));
app.get("/signup", (req, res) => res.sendFile(path.join(__dirname, "public", "signup", "index.html")));
app.get("/profile-page", (req, res) => res.sendFile(path.join(__dirname, "public", "profile", "index.html")));
app.get("/admin", (req, res) => res.sendFile(path.join(__dirname, "public", "admin", "index.html")));

app.listen(3000, () => console.log("Server running on port 3000 🔥"));