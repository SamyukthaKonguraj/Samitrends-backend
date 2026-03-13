// src/controllers/customerController.js
const { Customer } = require("../models");
const { Op } = require("sequelize");

exports.listCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getCustomer = async (req, res) => {
  try {
    const c = await Customer.findByPk(req.params.id);
    if (!c) return res.status(404).json({ error: "Not found" });
    res.json(c);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.findByMobile = async (req, res) => {
  try {
    const c = await Customer.findOne({ where: { mobile: req.params.mobile } });
    if (!c) return res.status(404).json({ error: "Not found" });
    res.json(c);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const { name, mobile } = req.body;
    const exists = await Customer.findOne({ where: { mobile } });
    if (exists) return res.status(409).json({ error: "Mobile already registered" });
    const c = await Customer.create({ name, mobile });
    res.status(201).json(c);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updatePoints = async (req, res) => {
  try {
    const { id } = req.params;
    const { points } = req.body;
    const c = await Customer.findByPk(id);
    if (!c) return res.status(404).json({ error: "Not found" });
    c.points = (c.points || 0) + Number(points || 0);
    await c.save();
    res.json(c);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ 1️⃣ Auto-delete customers with 0 points for 3 months
exports.autoDeleteInactiveCustomers = async (req, res) => {
  try {
    // Calculate cutoff date (3 months ago)
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 3);

    // Find and delete customers
    const deletedCount = await Customer.destroy({
      where: {
        points: 0,
        lastActive: { [Op.lt]: cutoffDate },
      },
    });

    res.json({ message: `${deletedCount} inactive customers deleted automatically.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ 2️⃣ Manual delete (by manager)
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const c = await Customer.findByPk(id);
    if (!c) return res.status(404).json({ error: "Customer not found" });

    await c.destroy();
    res.json({ message: `Customer '${c.name}' deleted successfully.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};