const Verification=require("../models/verification.js");
const User=require("../models/user.js");
const {verificationSchema}=require("../Schema.js");

module.exports.checkVerifications=async(req,res)=>{
    let verifications= await Verification.find({verificationStatus:"pending"}).populate({path:"organization"});
    res.render("verifyOrganizations/verifications.ejs",{verifications});
};

module.exports.showVerification=async(req,res)=>{
    let {vId}=req.params;
    let verification=await Verification.findById(vId).populate({path:"organization"});
    res.render("verifyOrganizations/showVerification.ejs",{verification});
};

//this is to approve verification request of an organization
module.exports.verifyVerification=async(req,res)=>{
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
};


//this is to reject a verification request of an organization
module.exports.rejectVerification=async(req,res)=>{
    let{vId}=req.params;
    let {rejectionReason}=req.body;
    let verification=await Verification.findById(vId);
    let uId=verification.organization;
    let user=await User.findById(uId);
    if(!rejectionReason){
        req.flash("error","provide rejection Reason");
        return res.redirect(`/verification/${vId}`);
        
    }
    verification.verificationStatus="rejected";
    verification.rejectionReason=rejectionReason;
    verification.reviewedBy=req.user._id;
    
    user.isVerified=false;
    await verification.save();
    await user.save();
    res.redirect("/verify");
};