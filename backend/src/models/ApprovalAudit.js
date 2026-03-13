const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/db");

class ApprovalAudit extends Model { }

ApprovalAudit.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  action: { type: DataTypes.ENUM("approve", "reject", "update"), allowNull: false },
  performedBy: { type: DataTypes.STRING, allowNull: false },
  note: { type: DataTypes.TEXT },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { sequelize, modelName: "ApprovalAudit", updatedAt: false });

module.exports = ApprovalAudit;
