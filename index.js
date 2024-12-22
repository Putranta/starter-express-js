const express = require("express");
const { User } = require("./models");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const jwt = require("jsonwebtoken");

// Load .env
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Health Check
app.get("/api/health", (req, res) => {
  res.send("Tess Backend is running");
});

// Gunakan JWT_SECRET dari .env
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key"; // fallback jika .env tidak ada

// Register Endpoint
app.post("/api/register", async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      password: hashedPassword,
      email,
    });

    res.status(201).json({
      message: "User registered successfully",
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: "Error registering user",
      error: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
});

// Login Endpoint
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, username: user.username }, // Payload
      JWT_SECRET, // Secret key
      { expiresIn: "1h" } // Token expiration
    );

    res.status(200).json({
      message: "Login successful",
      token: token, // Kirim token ke frontend
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error logging in",
      error: error.message,
    });
  }
});

// Protected Endpoint (contoh)
app.get("/api/profile", (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Ambil token dari "Bearer <token>"

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ message: "Profile data", data: decoded });
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
