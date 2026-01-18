const express=require("express");
const router=express.Router();
const Verification=require("../models/verification");
const {isAdmin,isLoggedIn}=require("../middlewares");

router.get("/verify",isLoggedIn,isAdmin,async(req,res)=>{
    let verifications= await Verification.find({verificationStatus:"pending"}).populate({path:"organization"});
    res.render("verifyOrganizations/verifications.ejs",{verifications});
});

router.get("/verification/:vId",isLoggedIn,isAdmin,async(req,res)=>{
    let {vId}=req.params;
    let verification=await Verification.findById(vId).populate({path:"organization"});
    res.render("verifyOrganizations/showVerification.ejs",{verification});
});

module.exports=router;