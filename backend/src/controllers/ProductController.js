// src/controllers/productController.js
// const { Product } = require("../models");
const { Op, col } = require("sequelize");
const { Product, Transaction, TransactionItem } = require("../models");


exports.listProducts = async (req, res) => {
  const q = req.query.q || "";
  try {
    const where = q ? { name: { [Product.sequelize.Op.like]: `%${q}%` } } : {};
    const products = await Product.findAll({ where });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const p = await Product.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: "Not found" });
    res.json(p);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, barcode, price, stock, threshold } = req.body;
    const product = await Product.create({ name, barcode, price, stock, threshold });
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const p = await Product.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: "Not found" });
    await p.update(req.body);
    res.json(p);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const p = await Product.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: "Not found" });
    await p.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getByBarcode = async (req, res) => {
  try {
    const p = await Product.findOne({ where: { barcode: req.params.barcode } });
    if (!p) return res.status(404).json({ error: "Not found" });
    res.json(p);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.lowStock = async (req, res) => {
  try {
    const low = await Product.findAll({
      where: {
        stock: {
          [Op.lte]: col("threshold")
        }
      }
    });
    res.json(low);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.stats = async (req, res) => {
  try {
    // Low stock (<5 qty)
    const lowStockCount = await Product.count({ where: { stock: { [Op.lt]: 5 } } });

    // Total product count
    const totalProducts = await Product.count();

    // Dates for today and yesterday
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Sales Today
    const salesTodayData = await Transaction.findOne({
      attributes: [
        [Product.sequelize.fn("SUM", Product.sequelize.col("totalAmount")), "salesToday"],
      ],
      where: {
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      },
      raw: true,
    });
    const salesToday = parseFloat(salesTodayData.salesToday || 0);

    // Sales Yesterday
    const salesYesterdayData = await Transaction.findOne({
      attributes: [
        [Product.sequelize.fn("SUM", Product.sequelize.col("totalAmount")), "salesYesterday"],
      ],
      where: {
        createdAt: {
          [Op.gte]: yesterday,
          [Op.lt]: today,
        },
      },
      raw: true,
    });
    const salesYesterday = parseFloat(salesYesterdayData.salesYesterday || 0);

    // Monthly Revenue (current month)
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const monthlyRevenueData = await Transaction.findOne({
      attributes: [
        [Product.sequelize.fn("SUM", Product.sequelize.col("totalAmount")), "monthlyRevenue"],
      ],
      where: {
        createdAt: {
          [Op.gte]: firstOfMonth,
          [Op.lt]: firstOfNextMonth,
        },
      },
      raw: true,
    });
    const monthlyRevenue = parseFloat(monthlyRevenueData.monthlyRevenue || 0);

    // Last Month Revenue
    const firstOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const firstOfThisMonth = firstOfMonth;

    const lastMonthRevenueData = await Transaction.findOne({
      attributes: [
        [Product.sequelize.fn("SUM", Product.sequelize.col("totalAmount")), "lastMonthRevenue"],
      ],
      where: {
        createdAt: {
          [Op.gte]: firstOfLastMonth,
          [Op.lt]: firstOfThisMonth,
        },
      },
      raw: true,
    });
    const lastMonthRevenue = parseFloat(lastMonthRevenueData.lastMonthRevenue || 0);

    res.json({
      lowStockCount,
      totalProducts,
      salesToday,
      salesYesterday,
      previewCount: salesToday - salesYesterday,
      monthlyRevenue,
      lastMonthRevenue,
    });
  } catch (err) {
    console.error("Error fetching product stats:", err);
    res.status(500).json({ error: "Server error" });
  }
};




// Top Selling Products (Bar Chart)
exports.topSelling = async (req, res) => {
  try {
    // mode=quantity or revenue
    const mode = req.query.mode || "quantity";

    const { fn, col, literal } = require("sequelize");

const items = await TransactionItem.findAll({
  attributes: [
    "productId",

    [fn("SUM", col("TransactionItem.quantity")), "totalQty"],

    [
      fn(
        "SUM",
        literal('"TransactionItem"."quantity" * "TransactionItem"."unitPrice"')
      ),
      "totalRevenue",
    ],
  ],

  include: [
    {
      model: Product,
      attributes: ["id", "name"], // include id also
    },
  ],

  group: [
    "TransactionItem.productId",
    "Product.id",
    "Product.name",
  ],

  order: [
    [
      literal(mode === "quantity" ? '"totalQty"' : '"totalRevenue"'),
      "DESC",
    ],
  ],

  limit: 10,
});


    const result = items.map(it => ({
      productId: it.productId,
      name: it.Product.name,
      totalQty: it.get("totalQty"),
      totalRevenue: it.get("totalRevenue")
    }));

    res.json(result);
  } catch (err) {
    console.error("Error fetching top selling products:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// Sales Trend (Line Chart)
exports.salesTrend = async (req, res) => {
 try {
  // default = daily
  const period = req.query.period || "daily";

  let dateFormat;

  // PostgreSQL format
  if (period === "weekly") dateFormat = "IYYY-IW";     // year-week
  else if (period === "monthly") dateFormat = "YYYY-MM"; // year-month
  else dateFormat = "YYYY-MM-DD";                       // daily

  const { fn, col, literal } = require("sequelize");

  const sales = await Transaction.findAll({
    attributes: [
      [fn("TO_CHAR", col("createdAt"), dateFormat), "period"],
      [fn("SUM", col("totalAmount")), "totalSales"],
    ],

    group: [literal("period")],
    order: [[literal("period"), "ASC"]],
  });

  const result = sales.map((s) => ({
    period: s.get("period"),
    totalSales: Number(s.get("totalSales")),
  }));

  res.json(result);

} catch (err) {
  console.error("Error fetching sales trend:", err);
  res.status(500).json({ error: "Server error" });
}

}
