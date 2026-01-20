const express=require("express");
const router=express.Router();
const {isVerified}=require("../middlewares");
const {isLoggedIn}=require("../middlewares");
const wrapAsync=require("../utils/wrapAsync");
const emergencyController=require("../controller/emergency.js");

router.route("/")
        .get(isLoggedIn,isVerified,emergencyController.renderCreateEmergencyForm)
        .post(isLoggedIn,isVerified,wrapAsync(emergencyController.createEmergency));
// router.get("/showEmergency",(req,res)=>{
//     res.render("emergency/showEmergency.ejs");
// });

module.exports=router;