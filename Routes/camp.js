const express=require("express");
const router=express.Router({mergeParams:true});
const {isVerified}=require("../middlewares");
const {isLoggedIn}=require("../middlewares");
const campController=require("../controller/camp.js");
const wrapAsync=require("../utils/wrapAsync");
const Camp=require("../models/camp.js");
const User=require("../models/user.js");


router.route("/")
        .get(isLoggedIn,isVerified,campController.renderCreateCampForm)
        .post(isLoggedIn,isVerified,wrapAsync(campController.createCamp));
        
router.route("/edit/:id")
        .get(isLoggedIn,isVerified,wrapAsync(campController.renderEditCampForm))
        .patch(isLoggedIn,isVerified,wrapAsync(campController.editCamp));


router.delete("/:id",isLoggedIn,isVerified,wrapAsync(campController.deleteCamp));

module.exports=router;