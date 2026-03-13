const express = require("express");
const router = express.Router();
const authCtrl = require("../controllers/authController");
const auth = require("../middleware/auth");

// First-time manager registration
router.post("/manager/register", authCtrl.registerManager);

// Login & get profile
router.post("/login", authCtrl.login);
router.get("/me", auth, authCtrl.me);
router.get("/active-cashier", auth, authCtrl.getCashierCounts);

// --- New logout route ---
router.post("/logout", auth, authCtrl.logout);

module.exports = router;
