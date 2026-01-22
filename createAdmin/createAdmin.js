// //require("dotenv").config();
// const mongoose = require("mongoose");
// const User = require("../models/user");
// const passport=require("passport");
// const { isVerified } = require("../middlewares");


// async function Main(){
//     await mongoose.connect('mongodb://127.0.0.1:27017/bloodDonation');
// }

// Main().then(()=>{console.log("connected to database");}).catch(err=>{console.log(err);});

// async function createAdmin() {
//   try {
//     const admin = new User({
//       username: "admin",
//       role: "admin",
//       city: "System",
//       country: "System",
//       email: "admin@system.com",
//       phone: "0000000000",
//       pincode:"0001",
//       isVerified:true
//     });
    

//     await User.register(admin, "Admin@123");
//     console.log("✅ Admin created successfully");
//   } catch (err) {
//     console.error("❌ Error creating admin:", err);
//   }
// }

// createAdmin();
 
// async function findAdmin(){
//     let foundAdmin= await User.findOne({role:"admin", username:"admin" });
//     console.log(foundAdmin);
// }

// //findAdmin();

// require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user");

async function Main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/bloodDonation");
}
Main()
  .then(() => console.log("✅ Connected to database"))
  .catch(err => console.log(err));


// ✅ Reusable function
async function createAdmin({ username, password, email, phone }) {
  try {
    const existing = await User.findOne({ username });
    if (existing) {
      console.log(`⚠️ Admin '${username}' already exists`);
      return;
    }

    const admin = new User({
      username,
      role: "admin",
      city: "System",
      country: "System",
      email,
      phone,
      pincode: "0001",
      isVerified: true
    });

    await User.register(admin, password);
    console.log(`✅ Admin '${username}' created successfully`);
  } catch (err) {
    console.error("❌ Error creating admin:", err.message);
  }
}


// ✅ Create multiple admins here
async function seedAdmins() {
  await createAdmin({
    username: "admin",
    password: "Admin@123",
    email: "admin@system.com",
    phone: "0000000000"
  });

  await createAdmin({
    username: "admin2",
    password: "Admin2@123",
    email: "admin2@system.com",
    phone: "1111111111"
  });
}

// 🚀 Run once
seedAdmins();
