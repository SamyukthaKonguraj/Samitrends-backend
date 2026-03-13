// src/controllers/transactionController.js
const { Transaction, TransactionItem, Product, Customer, User, Coupon } = require("../models");
const { Sequelize } = require("sequelize");

exports.createTransaction = async (req, res) => {
  // payload: { items, paymentMethod, customerId (opt), couponCode (opt), loyaltyPointsUsed (opt) }
  const t = await Transaction.sequelize.transaction();
  try {
    const { items, paymentMethod, customerId, couponCode, loyaltyPointsUsed } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: "Items required" });
    }

    // 1️⃣ Check stock & decrement atomically
    for (const it of items) {
      const prod = await Product.findByPk(it.productId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!prod) {
        await t.rollback();
        return res.status(404).json({ error: `Product ${it.productId} not found` });
      }
      if (prod.stock < it.qty) {
        await t.rollback();
        return res.status(409).json({ error: `Insufficient stock for product ${prod.name}` });
      }
      prod.stock -= it.qty;
      await prod.save({ transaction: t });
    }

    // 2️⃣ Compute subtotal
    let subtotal = 0;
    for (const it of items) subtotal += (it.unitPrice || 0) * it.qty;

    // 3️⃣ Apply coupon discount
    let couponDiscount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ where: { code: couponCode }, transaction: t });
      if (coupon && new Date(coupon.expiryDate) >= new Date()) {
        couponDiscount = (subtotal * coupon.discount) / 100;
      }
    }

    // 4️⃣ Compute loyalty discount
    let loyaltyDiscount = 0;
    let customer = null;
    if (customerId) {
      customer = await Customer.findByPk(customerId, { transaction: t, lock: t.LOCK.UPDATE });
      if (customer && loyaltyPointsUsed) {
        loyaltyDiscount = (loyaltyPointsUsed / 100) * 10; // 100 points = ₹10
        customer.points = Math.max(0, customer.points - loyaltyPointsUsed);
      }
    }

    // 5️⃣ Final total (round to 2 decimals)
    const total = Math.round((subtotal - couponDiscount - loyaltyDiscount) * 100) / 100;

    // 6️⃣ Create transaction
    const transaction = await Transaction.create({
      cashierId: req.user.id,
      customerId: customerId || null,
      totalAmount: total,
      paymentMethod,
      couponCode: couponCode || null,
      loyaltyDiscount
    }, { transaction: t });

    // 7️⃣ Insert items
    for (const it of items) {
      await TransactionItem.create({
        transactionId: transaction.id,
        productId: it.productId,
        quantity: it.qty,
        unitPrice: it.unitPrice
      }, { transaction: t });
    }

    // 8️⃣ Add earned loyalty points
    if (customer) {
      const earnedPoints = Math.floor(total / 10); // 1 point per ₹10 spent
      customer.points = (customer.points || 0) + earnedPoints;
      await customer.save({ transaction: t });
    }

    await t.commit();
    res.status(201).json({ message: "Transaction created", transactionId: transaction.id, status: "success" });
  } catch (err) {
    console.error(err);
    try { await t.rollback(); } catch { }
    res.status(500).json({ error: "Server error" });
  }
};


exports.listTransactions = async (req, res) => {
  try {
    // managers get all, cashiers get only their own
    const where = {};
    if (req.user.role === "cashier") where.cashierId = req.user.id;
    const list = await Transaction.findAll({ where, include: [{ model: TransactionItem }] });
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getTransaction = async (req, res) => {
  try {
    const trx = await Transaction.findByPk(req.params.id, { include: [{ model: TransactionItem }] });
    if (!trx) return res.status(404).json({ error: "Not found" });

    if (req.user.role === "cashier" && trx.cashierId !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(trx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.recent = async (req, res) => {
  try {
    const list = await Transaction.findAll({ order: [["createdAt", "DESC"]], limit: 20 });
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


exports.transactionCountByCashier = async (req, res) => {
  try {
    const counts = await Transaction.findAll({
      attributes: [
        "cashierId",
        [Sequelize.fn("DATE", Sequelize.col("Transaction.createdAt")), "date"],
        [Sequelize.fn("COUNT", Sequelize.col("Transaction.id")), "transactionCount"]
      ],
      include: [
        {
          model: User,
          as: "cashier",
          attributes: ["id", "fullName"]
        }
      ],
group: [
  "Transaction.cashierId",
  Sequelize.fn("DATE", Sequelize.col("Transaction.createdAt")),
  "cashier.id",
  "cashier.fullName"
],
      order: [
        ["cashierId", "ASC"],
        [Sequelize.fn("DATE", Sequelize.col("Transaction.createdAt")), "ASC"]
      ]
    });

    // Aggregate per cashier
    const result = {};
    counts.forEach(c => {
      const cashierId = c.cashierId;
      if (!result[cashierId]) {
        result[cashierId] = {
          cashierId,
          cashierName: c.cashier?.fullName || "Unknown",
          transactions: []
        };
      }
      result[cashierId].transactions.push({
        date: new Date(c.getDataValue("date")).toLocaleDateString("en-GB"),
        transactionCount: parseInt(c.getDataValue("transactionCount"), 10)
      });
    });

    res.json(Object.values(result));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
// Top 3 most used payment methods
exports.topPaymentMethods = async (req, res) => {
  try {


    const stats = await Transaction.findAll({
      attributes: [
        "paymentMethod",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"]
      ],
      group: ["paymentMethod"],
      order: [[Sequelize.fn("COUNT", Sequelize.col("id")), "DESC"]],
      limit: 3
    });


    if (!stats || stats.length === 0) {

      return res.status(200).json([]);
    }

    const result = stats.map(s => ({
      paymentMethod: s.paymentMethod,
      count: parseInt(s.getDataValue("count"), 10)
    }));

    res.json(result);
  } catch (err) {

    res.status(500).json({ error: "Server error" });
  }
};

// Top 3 customers with most points
exports.topCustomersByPoints = async (req, res) => {
  try {


    const customers = await Customer.findAll({
      attributes: ["id", "name", "points"],
      order: [["points", "DESC"]],
      limit: 3
    });


    if (!customers || customers.length === 0) {

      return res.status(200).json([]);
    }

    res.json(customers.map(c => c.toJSON()));
  } catch (err) {

    res.status(500).json({ error: "Server error" });
  }
};
