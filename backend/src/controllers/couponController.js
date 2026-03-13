// src/controllers/couponController.js
const { Coupon } = require("../models");
const { Op } = require("sequelize");

exports.list = async (req, res) => {
  const coupons = await Coupon.findAll();
  res.json(coupons);
};

exports.create = async (req, res) => {
  try {
    const { code, discount, expiryDate } = req.body;
    if (!code || !discount || !expiryDate)
      return res.status(400).json({ error: "Missing fields" });

    const c = await Coupon.create({ code, discount, expiryDate });
    res.status(201).json(c);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Validate coupon
exports.validate = async (req, res) => {
  try {
    const { code } = req.params;
    const now = new Date();

    const coupon = await Coupon.findOne({ where: { code } });
    if (!coupon) {
      return res.json({ valid: false, error: "Coupon not found" });
    }

    if (new Date(coupon.expiryDate) < now) {
      return res.json({ valid: false, error: "Coupon expired" });
    }

    return res.json({ valid: true, coupon });
  } catch (err) {
    console.error(err);
    res.status(500).json({ valid: false, error: "Server error" });
  }
};

// ✅ Update coupon
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, discount, expiryDate } = req.body;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) return res.status(404).json({ error: "Coupon not found" });

    if (code) coupon.code = code;
    if (discount) coupon.discount = discount;
    if (expiryDate) coupon.expiryDate = expiryDate;

    await coupon.save();
    res.json(coupon);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Delete coupon
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) return res.status(404).json({ error: "Coupon not found" });

    await coupon.destroy();
    res.json({ message: "Coupon deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
