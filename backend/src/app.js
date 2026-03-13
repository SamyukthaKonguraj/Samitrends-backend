// src/app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { syncDB } = require("./models"); 
const importRoutes = require("./routes/import");


const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/cashiers", require("./routes/cashiers"));
app.use("/api/products", require("./routes/products"));
app.use("/api/customers", require("./routes/customers"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/coupons", require("./routes/coupons"));
app.use("/import", importRoutes);


syncDB(); // creates/touches tables

module.exports = app;
