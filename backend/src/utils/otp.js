const crypto = require("crypto");

// Generate a 6-digit numeric OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP in-memory (or use DB/Redis for production)
const otpStore = new Map(); // key: email, value: { otp, expires }

function saveOTP(email, otp, ttl = 5 * 60 * 1000) {
  const expires = Date.now() + ttl;
  otpStore.set(email, { otp, expires });
}

function verifyOTP(email, otp) {
  const record = otpStore.get(email);
  if (!record) return false;
  if (record.expires < Date.now()) {
    otpStore.delete(email);
    return false;
  }
  if (record.otp === otp) {
    otpStore.delete(email);
    return true;
  }
  return false;
}

module.exports = { generateOTP, saveOTP, verifyOTP };
