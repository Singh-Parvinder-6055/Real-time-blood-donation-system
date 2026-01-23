const express=require("express");
const router=express.Router({mergeParams:true});
const {isVerified}=require("../middlewares");
const {isLoggedIn}=require("../middlewares");
const wrapAsync=require("../utils/wrapAsync");
const emergencyController=require("../controller/emergency.js");
const Emergency=require("../models/emergency.js");
const User=require("../models/user.js");

router.route("/emergency")
        .get(isLoggedIn,isVerified,emergencyController.renderCreateEmergencyForm)
        .post(isLoggedIn,isVerified,wrapAsync(emergencyController.createEmergency));
// router.get("/showEmergency",(req,res)=>{
//     res.render("emergency/showEmergency.ejs");
// });

router.delete("/emergency/destroy/:id",async(req,res)=>{
        let{id}=req.params;
        let emergency=await Emergency.findById(id);
        if(!emergency){
                req.flash("error","No emergency request found");
                return res.redirect(`/dashboard/${req.user._id}?role=${req.user.role}`);
        }
        if(emergency.status==="fulfilled"){
                req.flash("error","This emergency request is fulfilled, and cannot be deleted.");
               return res.redirect(`/dashboard/${req.user._id}?role=${req.user.role}`);
        }
        let patientId=emergency.patient;
        await User.findByIdAndUpdate(patientId,{$pull:{emergencies:emergency._id}});     
        
        await Emergency.findByIdAndDelete(id);
        req.flash("success","Emergency request deleted successfully");
        res.redirect(`/dashboard/${req.user._id}?role=${req.user.role}`);
});

module.exports=router;