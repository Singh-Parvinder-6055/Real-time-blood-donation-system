const Verification=require("../models/verification.js");
const User=require("../models/user.js");
const {verificationSchema}=require("../Schema.js");

module.exports.renderGetVerifiedForm=(req,res)=>{
    res.render("verifyOrganizations/getVerified.ejs");
};

module.exports.submitVerificationRequest=async(req,res)=>{
        let currUser= await User.findById(req.user._id);
        let verification=req.body.verification;
       // verification.role=user.role;
        verification.organization=currUser._id.toString();
        verification.document.documentUrl=req.file.path;
        
        let {error}=verificationSchema.validate(verification);
        if(error){
            return res.send(error);
        }

        let newVerification= new Verification(verification);

        currUser.verification=newVerification._id.toString();
        
        await newVerification.save();
        await currUser.save();
        req.flash("success","Verification Request Raised successfully");
        res.redirect("/");
};