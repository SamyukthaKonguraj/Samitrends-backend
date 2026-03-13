const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const { Product } = require("../models");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const router = express.Router();

// configure multer to upload excel file to memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /import/products
router.post(
  "/products",
  auth,
  role("manager"), // only manager can import
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // parse excel
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet);

      const inserted = [];
      const errors = [];

      for (const row of rows) {
        let { name, description, price, stock, category, barcode } = row;

        // Required fields check
        if (!name || !price || !stock) {
          errors.push({ row, reason: "Missing required fields" });
          continue;
        }

        // Convert barcode to uppercase if exists
        if (barcode) barcode = String(barcode).toUpperCase();

        try {
          const product = await Product.create({
            name,
            description: description || "",
            price: parseFloat(price),
            stock: parseInt(stock),
            category: category || "General",
            barcode: barcode || null
          });

          inserted.push(product);
        } catch (err) {
          errors.push({ row, reason: err.message });
        }
      }

      res.json({
        message: "Import completed",
        count: inserted.length,
        products: inserted,
        errors
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to import products" });
    }
  }
);

module.exports = router;
