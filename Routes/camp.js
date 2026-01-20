const express=require("express");
const router=express.Router();
const {isVerified}=require("../middlewares");
const {isLoggedIn}=require("../middlewares");
const campController=require("../controller/camp.js");
const wrapAsync=require("../utils/wrapAsync");



router.route("/")
        .get(isLoggedIn,isVerified,campController.renderCreateCampForm)
        .post(isLoggedIn,isVerified,wrapAsync(campController.createCamp));



module.exports=router;