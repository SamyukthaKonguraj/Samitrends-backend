// src/routes/customers.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/customerController");
const auth = require("../middleware/auth");

router.get("/", auth, ctrl.listCustomers);
router.get("/:id", auth, ctrl.getCustomer);
router.get("/mobile/:mobile", auth, ctrl.findByMobile);
router.post("/", auth, ctrl.createCustomer);
router.patch("/:id/points", auth, ctrl.updatePoints);
router.delete("/auto/delete-inactive", ctrl.autoDeleteInactiveCustomers); // automatic cleanup
router.delete("/:id", ctrl.deleteCustomer);

module.exports = router;
