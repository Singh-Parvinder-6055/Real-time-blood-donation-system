const express=require("express");
const router=express.Router();
const Verification=require("../models/verification");
const {isAdmin,isLoggedIn}=require("../middlewares");
const User=require("../models/user");

router.get("/verify",isLoggedIn,isAdmin,async(req,res)=>{
    let verifications= await Verification.find({verificationStatus:"pending"}).populate({path:"organization"});
    res.render("verifyOrganizations/verifications.ejs",{verifications});
});

router.get("/verification/:vId",isLoggedIn,isAdmin,async(req,res)=>{
    let {vId}=req.params;
    let verification=await Verification.findById(vId).populate({path:"organization"});
    res.render("verifyOrganizations/showVerification.ejs",{verification});
});

router.get("/verify/:vId",isLoggedIn,isAdmin,async(req,res)=>{
    let{vId}=req.params;
    let verification=await Verification.findById(vId);
    let uId=verification.organization;
    let user=await User.findById(uId);

    verification.verificationStatus="approved";
    verification.reviewedBy=req.user._id;
    user.isVerified=true;
    await verification.save();
    await user.save();
    res.redirect("/verify");
});

router.get("/reject/:vId",isLoggedIn,isAdmin,async(req,res)=>{
    let{vId}=req.params;
    let verification=await Verification.findById(vId);
    let uId=verification.organization;
    let user=await User.findById(uId);

    verification.verificationStatus="rejected";
    verification.reviewedBy=req.user._id;
    user.isVerified=false;
    await verification.save();
    await user.save();
    res.redirect("/verify");
});
module.exports=router;
