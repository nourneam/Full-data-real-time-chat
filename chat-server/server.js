// server.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// استيراد نموذج المستخدم
const User = require("./models/User");

const app = express();
app.use(cors());
app.use(express.json());

// الاتصال بقاعدة البيانات
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // عنوان تطبيق React
    methods: ["GET", "POST"],
  },
});

// متغيرات للاحتفاظ بحالة الاتصال والرسائل
const connectedUsers = {};
const messageHistory = [
  { username: "System", text: "Welcome to the chat!", timestamp: new Date() },
];

// التسجيل - إنشاء حساب جديد
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // التحقق من البيانات
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // التحقق من عدم وجود المستخدم مسبقًا
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(409).json({
        error: "Username or email address is already in use.",
      });
    }

    // إنشاء مستخدم جديد
    const newUser = new User({ username, email, password });
    await newUser.save();

    // إنشاء رمز المصادقة JWT
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Registration successful",
      user: { username, email },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration error, please try again" });
  }
});

// تسجيل الدخول
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // التحقق من البيانات
    if (!username || !password) {
      return res.status(400).json({ error: "Requried, Username or Password" });
    }

    // البحث عن المستخدم
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: "Error, Username or Password" });
    }

    // التحقق من كلمة المرور
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Error, Username or Password" });
    }

    // إنشاء رمز المصادقة JWT
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "You have successfully logged in.",
      user: { username: user.username, email: user.email },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login Error, Try again " });
  }
});

// التحقق من رمز JWT
app.get("/api/verify-token", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ valid: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ valid: false });
    }

    res.json({
      valid: true,
      user: { username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ valid: false });
  }
});

// معالجة اتصالات Socket.IO
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // انضمام المستخدم للدردشة
  socket.on("join", (username) => {
    console.log(`User joined: ${username}`);

    // تخزين معلومات المستخدم
    connectedUsers[socket.id] = username;

    // إرسال إشعار للجميع بانضمام مستخدم جديد
    io.emit("userJoined", {
      username,
      users: Object.values(connectedUsers),
    });

    // إرسال سجل الدردشة للمستخدم الجديد
    socket.emit("chatHistory", messageHistory);
  });

  // معالجة الرسائل الواردة
  socket.on("sendMessage", (message) => {
    const username = connectedUsers[socket.id];

    if (!username) return;

    console.log(`Message from ${username}: ${message}`);

    // إنشاء كائن الرسالة
    const newMessage = {
      username,
      text: message,
      timestamp: new Date(),
    };

    // تخزين الرسالة في السجل
    messageHistory.push(newMessage);

    // الحد من حجم السجل (اختياري)
    if (messageHistory.length > 100) {
      messageHistory.shift();
    }

    // إرسال الرسالة لجميع المتصلين
    io.emit("message", newMessage);
  });

  // معالجة قطع الاتصال
  socket.on("disconnect", () => {
    const username = connectedUsers[socket.id];

    if (username) {
      console.log(`User disconnected: ${username}`);

      // إزالة المستخدم من قائمة المتصلين
      delete connectedUsers[socket.id];

      // إشعار الجميع بخروج المستخدم
      io.emit("userLeft", {
        username,
        users: Object.values(connectedUsers),
      });
    }
  });
});

// المسار الرئيسي
app.get("/", (req, res) => {
  res.send("Chat Server is running");
});

// تشغيل السيرفر
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
