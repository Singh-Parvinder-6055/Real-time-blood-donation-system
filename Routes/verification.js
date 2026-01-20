const express=require("express");
const router=express.Router();
const multer=require("multer");
const {storage}=require("../cloudConfig.js");
const upload = multer({storage});
const {isLoggedIn,isOrganization}=require("../middlewares.js");
const verificationController=require("../controller/verification.js");
const wrapAsync=require("../utils/wrapAsync");



router.route("/")
        .get(isLoggedIn,isOrganization,verificationController.renderGetVerifiedForm)
        .post(isLoggedIn,isOrganization,
            upload.single('document'),wrapAsync(verificationController.submitVerificationRequest));

module.exports=router;