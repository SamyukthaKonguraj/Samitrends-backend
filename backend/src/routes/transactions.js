// src/routes/transactions.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/transactionController");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

// Transactions
router.post("/", auth, role("cashier"), ctrl.createTransaction);
router.get("/", auth, ctrl.listTransactions);
router.get("/recent", auth, role("manager"), ctrl.recent);
router.get("/by-cashier", auth, role("manager"), ctrl.transactionCountByCashier);

router.get("/payment-methods", auth, role("manager"), ctrl.topPaymentMethods);
router.get("/top-loyal-customers", auth, role("manager"), ctrl.topCustomersByPoints);


router.get("/:id", auth, ctrl.getTransaction);


module.exports = router;
