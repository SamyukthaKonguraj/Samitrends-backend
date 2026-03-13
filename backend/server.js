require("dotenv").config();
const app = require("./src/app");
const cron = require("node-cron");
const { autoDeleteInactiveCustomers } = require("./src/controllers/customerController");

const PORT = process.env.PORT || 5000;

// ✅ CRON JOB — runs every 1st day of month at 00:00
cron.schedule("0 0 1 * *", async () => {
  console.log("🕐 Running scheduled cleanup: deleting inactive customers...");
  try {
    // Create fake request/response to reuse the same controller
    const fakeReq = {};
    const fakeRes = {
      json: (output) => console.log("✅ Auto-cleanup result:", output),
      status: () => fakeRes,
    };

    await autoDeleteInactiveCustomers(fakeReq, fakeRes);
  } catch (err) {
    console.error("❌ Auto-delete failed:", err);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
