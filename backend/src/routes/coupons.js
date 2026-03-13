// src/routes/coupons.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/couponController");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

router.get("/", auth, ctrl.list);
router.post("/", auth, role("manager"), ctrl.create);
router.get("/validate/:code", auth, ctrl.validate);
router.put("/:id", auth, role("manager"), ctrl.update);
// delete coupon (only manager)
router.delete("/:id", auth, role("manager"), ctrl.remove);


module.exports = router;
