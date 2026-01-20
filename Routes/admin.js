const express=require("express");
const router=express.Router();
const {isAdmin,isLoggedIn}=require("../middlewares");
const wrapAsync=require("../utils/wrapAsync");
const adminController=require("../controller/admin.js");

router.get("/verify",isLoggedIn,isAdmin,wrapAsync(adminController.checkVerifications));

router.get("/verification/:vId",isLoggedIn,isAdmin,wrapAsync(adminController.showVerification));

router.patch("/verify/:vId",isLoggedIn,isAdmin,wrapAsync(adminController.verifyVerification));

router.patch("/reject/:vId",isLoggedIn,isAdmin,wrapAsync(adminController.rejectVerification));


module.exports=router;
