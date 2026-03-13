// src/models/User.js
const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/db");

class User extends Model { }

User.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fullName: { type: DataTypes.STRING, allowNull: false },
  username: { type: DataTypes.STRING, allowNull: false, unique: "idx_username" },
  password: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: true },
  mobile: { type: DataTypes.STRING, allowNull: true },
  location: { type: DataTypes.STRING, allowNull: true },
  role: { type: DataTypes.ENUM("manager", "cashier"), allowNull: false },
  status: { type: DataTypes.ENUM("pending", "approved", "rejected"), defaultValue: "pending" },
  approvedBy: { type: DataTypes.STRING },
  approvalDate: { type: DataTypes.DATE },

  // ✅ Add this new column
  isLoggedIn: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  sequelize,
  modelName: "User"
});

module.exports = User;
