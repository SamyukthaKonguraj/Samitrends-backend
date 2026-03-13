const nodemailer = require("nodemailer");

// create transporter using Gmail or any SMTP service
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MANAGER_EMAIL,    // manager's email
    pass: process.env.MANAGER_EMAIL_PASS // app password if using Gmail
  }
});

async function sendOTP(email, otp) {
  const mailOptions = {
    from: process.env.MANAGER_EMAIL,
    to: email,
    subject: "OTP Verification for Cashier Registration",
    text: `Your OTP to approve the cashier registration is: ${otp}. It is valid for 5 minutes.`
  };
  await transporter.sendMail(mailOptions);
}

module.exports = { sendOTP };
