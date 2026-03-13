// src/routes/cashiers.js
const express = require("express");
const router = express.Router();
const cashierCtrl = require("../controllers/cashierController");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

// router.post("/register", cashierCtrl.registerCashier);
router.post("/request-otp", cashierCtrl.requestCashierOTP); // Step 1
router.post("/verify-otp", cashierCtrl.verifyCashierOTP);
router.get("/pending", auth, role("manager"), cashierCtrl.getPending);
router.get("/", auth, role("manager"), cashierCtrl.getAll);
router.patch("/:id/approve", auth, role("manager"), cashierCtrl.approveCashier);
router.patch("/:id/reject", auth, role("manager"), cashierCtrl.rejectCashier);
router.get("/me", auth, role("cashier"), cashierCtrl.getMyProfile);
router.delete("/:id", auth, role("manager"), cashierCtrl.deleteCashier);
router.put("/:id", auth, role("manager"), cashierCtrl.updateCashier);


module.exports = router;
