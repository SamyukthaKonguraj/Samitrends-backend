// src/controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models"); // expects src/models/index.js exports User


const SALT_ROUNDS = 10;

exports.registerManager = async (req, res) => {
  try {
    // Only allow first-time manager creation
    const existing = await User.findOne({ where: { role: "manager" } });
    if (existing) return res.status(403).json({ error: "Manager already exists" });

    const { username, password, fullName } = req.body;

    if (!username || !password || !fullName) {
      return res.status(400).json({ error: "username, password & fullName required" });
    }


    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const manager = await User.create({
      username,
      fullName,
      password: hashed,
      role: "manager",
      status: "approved",
      approvalDate: new Date(),
      approvedBy: username,
    });

    // Do not send password back
    const out = { id: manager.id, username: manager.username, role: manager.role };
    res.status(201).json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "username & password required" });

    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    // Cashier must be approved
    if (user.role === "cashier" && user.status !== "approved") {
      return res.status(403).json({ error: "Cashier pending approval" });
    }

    // --- Mark as logged in ---
    await user.update({ isLoggedIn: true, lastLogin: new Date() });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "mysecret",
      { expiresIn: "8h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// authController.js
exports.logout = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.update({ isLoggedIn: false });

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


exports.getCashierCounts = async (req, res) => {
  if (req.user.role !== "manager") {
    return res.status(403).json({ error: "Only managers can view cashier counts" });
  }

  try {
    const [pendingCount, approvedCount, rejectedCount, activeCount] = await Promise.all([
      User.count({ where: { role: "cashier", status: "pending" } }),
      User.count({ where: { role: "cashier", status: "approved" } }),
      User.count({ where: { role: "cashier", status: "rejected" } }),
      User.count({ where: { role: "cashier", status: "approved", isLoggedIn: true } })
    ]);

    res.json({
      success: true,
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
      active: activeCount

    });
  } catch (err) {
    console.error("Error fetching cashier counts:", err);
    res.status(500).json({ error: "Server error while fetching cashier counts" });
  }
};


exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ["password"] } });
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
