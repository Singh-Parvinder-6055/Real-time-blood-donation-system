const Verification=require("../models/verification.js");
const User=require("../models/user.js");
const {verificationSchema}=require("../Schema.js");
const ExpressError=require("../utils/ExpressError.js");


module.exports.renderGetVerifiedForm=(req,res)=>{
    res.render("verifyOrganizations/getVerified.ejs");
};

module.exports.submitVerificationRequest=async(req,res)=>{
        req.session.redirectUrl="/getVerified";   //we are storing the this redirectUrl in the session as if any error occurs, our error handling middleware can handle it(i.e. send a flash message and redirect us)
        let currUser= await User.findById(req.user._id);
        let verification=req.body.verification;
       // verification.role=user.role;
        verification.organization=currUser._id.toString();
        verification.document.documentUrl=req.file.path;
        
        let {error}=verificationSchema.validate(verification);
        if(error){
            let errMsg=error.details.map(el=>el.message).join(",");
            //console.log(errMsg);
    
        throw new ExpressError(400,errMsg);
        }

        let newVerification= new Verification(verification);

        currUser.verification=newVerification._id.toString();
        
        await newVerification.save();
        await currUser.save();
        req.flash("success","Verification Request Raised successfully");
        res.redirect("/");
};