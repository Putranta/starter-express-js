const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

// Register User
exports.register = async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashedPassword,
      email,
    });
    res.status(201).json({ message: "User registered", data: user });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Registration failed", error: error.message });
  }
};

// Login User
exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

exports.profile = async (req, res) => {
  const authHeader = req.headers.authorization;

  const token = authHeader.split(" ")[1]; // Ambil token dari "Bearer <token>"

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ message: "Profile data", data: decoded });
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
