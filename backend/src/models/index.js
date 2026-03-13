// src/models/index.js
const sequelize = require("../config/db");

// Require all models
const User = require("../models/User");
const ApprovalAudit = require("./approvalAudit");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Coupon = require("../models/Coupon");
const { Transaction, TransactionItem } = require("../models/Transaction");

// Define associations AFTER models are loaded
User.hasMany(Transaction, { foreignKey: "cashierId" });
Transaction.belongsTo(User, { as: "cashier", foreignKey: "cashierId" });

Customer.hasMany(Transaction, { foreignKey: "customerId" });
Transaction.belongsTo(Customer, { foreignKey: "customerId" });

Transaction.hasMany(TransactionItem, { foreignKey: "transactionId" });
TransactionItem.belongsTo(Transaction, { foreignKey: "transactionId" });

Product.hasMany(TransactionItem, { foreignKey: "productId" });
TransactionItem.belongsTo(Product, { foreignKey: "productId" });

// Sync helper
const syncDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected");
    await sequelize.sync({ alter: true });
    console.log("Synced models");
  } catch (err) {
    console.error("DB sync error:", err);
  }
};

module.exports = {
  sequelize,
  syncDB,
  User,
  ApprovalAudit,
  Product,
  Customer,
  Coupon,
  Transaction,
  TransactionItem,
};
