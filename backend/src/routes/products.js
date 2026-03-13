const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const role = require("../middleware/role");
const ProductController = require("../controllers/ProductController");

// Product list/search
router.get("/", auth, ProductController.listProducts);
router.get("/barcode/:barcode", auth, ProductController.getByBarcode);

// stats & special endpoints BEFORE :id
router.get("/low-stock", auth, role("manager"), ProductController.lowStock);
router.get("/sales-report", auth, role("manager"), ProductController.stats);
router.get("/top-selling", auth, role("manager"), ProductController.topSelling);
router.get("/sales-trend", auth, role("manager"), ProductController.salesTrend);

// single product routes
router.get("/:id", auth, ProductController.getProduct);
router.post("/", auth, role("manager"), ProductController.createProduct);
router.patch("/:id", auth, role("manager"), ProductController.updateProduct);
router.delete("/:id", auth, role("manager"), ProductController.deleteProduct);

module.exports = router;
