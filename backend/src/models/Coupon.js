const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Coupon = sequelize.define("Coupon", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING, unique: true },
  discount: { type: DataTypes.FLOAT, allowNull: false }, // percentage
  expiryDate: { type: DataTypes.DATE, allowNull: false }
});

module.exports = Coupon;
