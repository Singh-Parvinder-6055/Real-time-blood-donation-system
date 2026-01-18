const express=require("express");
const router=express.Router();
const multer=require("multer");
const {storage}=require("../cloudConfig");
const upload = multer({storage});
const {isLoggedIn,isOrganization}=require("../middlewares");
const {verificationSchema}=require("../Schema");
const Verification=require("../models/verification");


router.get("/getVerified",isLoggedIn,isOrganization, (req,res)=>{
    res.render("verifyOrganizations/getVerified.ejs");
});

router.post("/getVerified",isLoggedIn,isOrganization,
            upload.single('document'),async(req,res)=>{
        let user=res.locals.currUser;
        let verification=req.body.verification;
       // verification.role=user.role;
        verification.organization=user._id.toString();
        verification.document.documentUrl=req.file.path;
        
        let {error}=verificationSchema.validate(verification);
        if(error){
            return res.send(error);
        }

        let newVerification= await new Verification(verification);

        user.verification=newVerification._id.toString();
        
        await newVerification.save();
        await user.save();
        req.flash("success","Verification Request Raised successfully");
        res.redirect("/");
});

module.exports=router;