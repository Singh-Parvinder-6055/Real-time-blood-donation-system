const Verification=require("../models/verification.js");
const User=require("../models/user.js");
const ExpressError=require("../utils/ExpressError.js");

module.exports.checkVerifications=async(req,res)=>{
    req.session.redirectUrl="/verify";
    let verifications= await Verification.find({verificationStatus:"pending"}).populate({path:"organization"});
    
    res.render("verifyOrganizations/verifications.ejs",{verifications});
};

module.exports.showVerification=async(req,res)=>{
    req.session.redirectUrl="/verify";
    let {vId}=req.params;
    let verification=await Verification.findById(vId).populate({path:"organization"});
    if(!verification){
        req.flash("error","verification not found");
        res.redirect("/verify");
    }
    res.render("verifyOrganizations/showVerification.ejs",{verification});
};

//this is to approve verification request of an organization
module.exports.verifyVerification=async(req,res)=>{
    req.session.redirectUrl="/verify";
    let{vId}=req.params;
    let verification=await Verification.findById(vId);
    if(!verification){
        req.flash("error","verification request does not exist");
        res.redirect("/verify");
    }
    let uId=verification.organization;
    let user=await User.findById(uId);
    if(!user){
        req.flash("error","Organization this verification request belongs to,is not found");
        res.redirect(`/verification/${vId}`);
    }

    verification.verificationStatus="approved";
    verification.reviewedBy=req.user._id;
    
    user.isVerified=true;
    
    await verification.save();
    await user.save();
    let adminDashboard=req.session.dashboardRedirect;
    if(adminDashboard){
        res.redirect(adminDashboard);
    }
    res.redirect("/verify");
};


//this is to reject a verification request of an organization
module.exports.rejectVerification=async(req,res)=>{
    req.session.redirectUrl="/verify";
    let{vId}=req.params;
    let {rejectionReason}=req.body;
    let verification=await Verification.findById(vId);
    if(!verification){
        req.flash("error","verification request does not exist");
        res.redirect("/verify");
    }
    let uId=verification.organization;
    let user=await User.findById(uId);
    if(!user){
        req.flash("error","Organization this verification request belongs to,is not found");
        res.redirect(`/verification/${vId}`);
    }
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
    let adminDashboard=req.session.dashboardRedirect;
    if(adminDashboard){
        res.redirect(adminDashboard);
    }
    res.redirect("/verify");
    res.redirect("/verify");
};