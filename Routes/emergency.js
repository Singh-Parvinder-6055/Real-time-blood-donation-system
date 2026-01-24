const express=require("express");
const router=express.Router({mergeParams:true});
const {isVerified,isLoggedIn,isNotAdmin,isNotOrganization,isNotPatient}=require("../middlewares");
const wrapAsync=require("../utils/wrapAsync");
const emergencyController=require("../controller/emergency.js");
const Emergency=require("../models/emergency.js");
const User=require("../models/user.js");

router.route("/")
        .get(isLoggedIn,isVerified,emergencyController.renderCreateEmergencyForm)
        .post(isLoggedIn,isVerified,wrapAsync(emergencyController.createEmergency));
// router.get("/showEmergency",(req,res)=>{
//     res.render("emergency/showEmergency.ejs");
// });

router.delete("/:id",isLoggedIn,isVerified,wrapAsync(emergencyController.destroyEmergency));

router.patch("/fulfill/:id",isLoggedIn,isNotAdmin,isNotOrganization,isNotPatient,wrapAsync(emergencyController.fulfillEmergency));


router.patch("/cancelFulfill/:id",isLoggedIn,wrapAsync(emergencyController.cancelFulfillEmergency));
module.exports=router;