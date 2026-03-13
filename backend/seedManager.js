const User = require("./src/models/User");
const bcrypt = require("bcrypt");

async function createManager() {
  try {

    const hashedPassword = await bcrypt.hash("manager123", 10);

    await User.create({
      fullName: "Main Manager",
      username: "manager1",
      password: hashedPassword,
      email: "manager@gmail.com",
      mobile: "9999999999",
      location: "Head Office",
      role: "manager",
      status: "approved",
      approvedBy: "system",
      approvalDate: new Date(),
      isLoggedIn: false
    });

    console.log("✅ Manager created successfully");
    process.exit();

  } catch (error) {
    console.error("❌ Error creating manager:", error);
    process.exit();
  }
}

createManager();
