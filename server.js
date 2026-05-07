const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const User = require("./models/User");

const app = express();

app.use(express.json());
app.use(cors());

// 🔥 حط رابط MongoDB Atlas هون
mongodb://USERNAME:PASSWORD@ac-jkk4roe-shard-00-00.xsnskpq.mongodb.net:27017,ac-jkk4roe-shard-00-01.xsnskpq.mongodb.net:27017,ac-jkk4roe-shard-00-02.xsnskpq.mongodb.net:27017/myDatabase?ssl=true&replicaSet=atlas-685s4r-shard-0&authSource=admin&appName=Cluster0  .catch(err => console.log(err));


// ================= SIGNUP =================
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // تحقق إذا المستخدم موجود
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "Email already exists ❌" });
    }

    // تشفير الباسورد
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء المستخدم
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    res.json({ message: "User created 🔥" });

  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});


// ================= LOGIN =================
app.post("/login", async (req, res) => {
  try {
    const { input, password } = req.body;

    const user = await User.findOne({
      $or: [{ username: input }, { email: input }]
    });

    if (!user) {
      return res.json({ message: "User not found ❌" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ message: "Wrong password ❌" });
    }

    const token = jwt.sign({ id: user._id }, "secretkey");

    res.json({ token });

  } catch (error) {
    res.json({ message: "Error ❌", error });
  }
});


// ================= TEST =================
app.get("/", (req, res) => {
  res.send("API is working 🔥");
});


app.listen(3000, () => {
  console.log("Server running on port 3000 🔥");
});