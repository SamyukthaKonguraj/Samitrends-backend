const bcrypt = require("bcrypt");
const { User, ApprovalAudit } = require("../models");
const { sendOTP } = require("../config/mailer"); // your real email function
const SALT_ROUNDS = 10;

// Temporary in-memory storage
const tempRegistrations = new Map(); // username => registration data
const tempOTPs = new Map();          // managerEmail => { code, expiresAt }

/**
 * Step 1: Request OTP (Cashier fills registration form)
 */
exports.requestCashierOTP = async (req, res) => {
  try {
    const { username, fullName, password, email, mobile, location } = req.body;
    if (!username || !fullName || !password || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Store temporary registration
    tempRegistrations.set(username, { username, fullName, password, email, mobile, location });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    tempOTPs.set(process.env.MANAGER_EMAIL, { code: otp, expiresAt });

    // Send OTP to manager email
    await sendOTP(process.env.MANAGER_EMAIL, `Cashier OTP: ${otp}`, `New cashier "${username}" requests registration.`);

    res.json({ message: "OTP sent to manager email" });
  } catch (err) {
    console.error("Error requesting cashier OTP:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Step 2: Verify OTP and create cashier (status: "pending")
 */
exports.verifyCashierOTP = async (req, res) => {
  try {
    const { username, otp } = req.body;
    const stored = tempOTPs.get(process.env.MANAGER_EMAIL);

    if (!stored || stored.code.toString() !== otp.toString()) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (Date.now() > stored.expiresAt) {
      tempOTPs.delete(process.env.MANAGER_EMAIL);
      return res.status(400).json({ error: "OTP expired" });
    }

    // Remove OTP after use
    tempOTPs.delete(process.env.MANAGER_EMAIL);

    // Retrieve temporary registration data
    const tempData = tempRegistrations.get(username);
    if (!tempData) return res.status(400).json({ error: "No registration request found" });

    tempRegistrations.delete(username);

    // Hash password
    const hashed = await bcrypt.hash(tempData.password, SALT_ROUNDS);

    // Create cashier with "pending" status
    const cashier = await User.create({
      ...tempData,
      password: hashed,
      role: "cashier",
      status: "pending"
    });

    res.status(201).json({
      message: "Cashier registered; pending manager approval",
      cashier: {
        id: cashier.id,
        fullName: cashier.fullName,
        username: cashier.username,
        mobile: cashier.mobile,
        email: cashier.email,
        location: cashier.location,
        status: cashier.status
      }
    });
  } catch (err) {
    console.error("Error verifying cashier OTP:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get all pending cashiers
 */
exports.getPending = async (req, res) => {
  try {
    const pending = await User.findAll({
      where: { role: "cashier", status: "pending" },
      attributes: ["id", "username", "createdAt", "status"]
    });
    res.json(pending);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get all cashiers with counts
 */
exports.getAll = async (req, res) => {
  try {
    const cashiers = await User.findAll({
      where: { role: "cashier" },
      attributes: [
        "id", "fullName", "mobile", "email", "location", "username",
        "status", "approvedBy", "approvalDate", "createdAt", "updatedAt"
      ],
      order: [["createdAt", "DESC"]]
    });

    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
      User.count({ where: { role: "cashier", status: "pending" } }),
      User.count({ where: { role: "cashier", status: "approved" } }),
      User.count({ where: { role: "cashier", status: "rejected" } })
    ]);

    res.json({
      success: true,
      counts: { pending: pendingCount, approved: approvedCount, rejected: rejectedCount },
      total: cashiers.length,
      cashiers
    });
  } catch (err) {
    console.error("Error fetching cashiers:", err);
    res.status(500).json({ error: "Server error while fetching cashiers" });
  }
};

/**
 * Approve cashier
 */
exports.approveCashier = async (req, res) => {
  const t = await User.sequelize.transaction();
  try {
    const { id } = req.params;
    const cashier = await User.findByPk(id, { transaction: t });
    if (!cashier) {
      await t.rollback();
      return res.status(404).json({ error: "Cashier not found" });
    }

    cashier.status = "approved";
    cashier.approvedBy = req.user.username;
    cashier.approvalDate = new Date();
    await cashier.save({ transaction: t });

    await ApprovalAudit.create({
      userId: cashier.id,
      action: "approve",
      performedBy: req.user.username,
      note: req.body.note || null
    }, { transaction: t });

    await t.commit();
    res.json({
      message: "Cashier approved",
      cashier: {
        id: cashier.id,
        username: cashier.username,
        status: cashier.status,
        approvedBy: cashier.approvedBy,
        approvalDate: cashier.approvalDate
      }
    });
  } catch (err) {
    console.error(err);
    await t.rollback();
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Reject cashier
 */
exports.rejectCashier = async (req, res) => {
  const t = await User.sequelize.transaction();
  try {
    const { id } = req.params;
    const cashier = await User.findByPk(id, { transaction: t });
    if (!cashier) {
      await t.rollback();
      return res.status(404).json({ error: "Cashier not found" });
    }

    cashier.status = "rejected";
    await cashier.save({ transaction: t });

    await ApprovalAudit.create({
      userId: cashier.id,
      action: "reject",
      performedBy: req.user.username,
      note: req.body.note || null
    }, { transaction: t });

    await t.commit();
    res.json({
      message: "Cashier rejected",
      cashier: { id: cashier.id, username: cashier.username, status: cashier.status }
    });
  } catch (err) {
    console.error(err);
    await t.rollback();
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get cashier profile
 */
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const cashier = await User.findOne({
      where: { id: userId, role: "cashier" },
      attributes: ["id", "fullName", "username", "mobile", "email", "location", "status", "role", "createdAt"]
    });
    if (!cashier) return res.status(404).json({ error: "Cashier not found" });

    res.json(cashier);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Delete cashier
 */
exports.deleteCashier = async (req, res) => {
  try {
    const { id } = req.params;
    const cashier = await User.findOne({ where: { id, role: "cashier" } });
    if (!cashier) return res.status(404).json({ error: "Cashier not found" });

    await cashier.destroy();
    res.json({ message: "Cashier deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Update cashier (manager only)
 */
exports.updateCashier = async (req, res) => {
  if (req.user.role !== "manager") return res.status(403).json({ error: "Only managers can update cashier details" });

  const t = await User.sequelize.transaction();
  try {
    const { id } = req.params;
    const { fullName, mobile, email, location, username, note } = req.body;

    const cashier = await User.findOne({ where: { id, role: "cashier" }, transaction: t });
    if (!cashier) {
      await t.rollback();
      return res.status(404).json({ error: "Cashier not found" });
    }

    if (username && username !== cashier.username) {
      const exists = await User.findOne({ where: { username } });
      if (exists) {
        await t.rollback();
        return res.status(409).json({ error: "Username already taken" });
      }
      cashier.username = username;
    }

    if (fullName) cashier.fullName = fullName;
    if (mobile) cashier.mobile = mobile;
    if (email) cashier.email = email;
    if (location) cashier.location = location;

    await cashier.save({ transaction: t });

    await ApprovalAudit.create({
      userId: cashier.id,
      action: "update",
      performedBy: req.user.username,
      note: note || null
    }, { transaction: t });

    await t.commit();

    res.json({
      message: "Cashier updated successfully",
      cashier: {
        id: cashier.id,
        fullName: cashier.fullName,
        username: cashier.username,
        mobile: cashier.mobile,
        email: cashier.email,
        location: cashier.location,
        status: cashier.status
      }
    });
  } catch (err) {
    console.error(err);
    await t.rollback();
    res.status(500).json({ error: "Server error while updating cashier" });
  }
};
