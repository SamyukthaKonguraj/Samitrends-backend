const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/db");

class Transaction extends Model { }
class TransactionItem extends Model { }

Transaction.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    cashierId: { type: DataTypes.INTEGER, allowNull: false },
    customerId: { type: DataTypes.INTEGER },

    subtotal: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },

    totalAmount: { type: DataTypes.FLOAT, allowNull: false },

    paymentMethod: {
      type: DataTypes.ENUM("cash", "upi", "Debit", "Credit"),
      allowNull: false,
    },

    // 🧾 Coupon info
    couponCode: { type: DataTypes.STRING, allowNull: true },
    couponDiscount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },

    // 💎 Loyalty info
    loyaltyDiscount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  },
  { sequelize, modelName: "Transaction" }
);

TransactionItem.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    transactionId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    unitPrice: { type: DataTypes.FLOAT, allowNull: false },
  },
  { sequelize, modelName: "TransactionItem" }
);

module.exports = { Transaction, TransactionItem };
