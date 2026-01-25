const express=require("express");
const router=express.Router();
const passport=require("passport");
const {isLoggedIn,saveRedirectUrl}=require("../middlewares.js");
const userController=require("../controller/user.js");
const wrapAsync=require("../utils/wrapAsync");
const Emergency=require("../models/emergency.js");
const Camp=require("../models/camp.js");
const User=require("../models/user.js");
router.route("/signup")
            .get(userController.renderSignUpForm)
            .post(wrapAsync(userController.signUpUser));

router.route("/login")
            .get(userController.renderLoginForm)
            .post(saveRedirectUrl,passport.authenticate('local',  //the passport.authenticate() internally calls req.login(user)  and passes the user after accessing the user from req.user
                    {failureRedirect:'/login', 
                    failureFlash:true}),
                    userController.loginUser
            );

router.get("/logout",userController.logOutUser);



router.get("/dashboard",isLoggedIn,wrapAsync(userController.visitDashboard));

router.get("/activeEmergencies",isLoggedIn,wrapAsync(userController.activeEmergencies));

router.get("/upcomingCamps",isLoggedIn,wrapAsync(userController.upcomingCamps));

router.get("/activeEmergenciesWithPincode",wrapAsync(userController.activeEmergenciesWithPincode));

router.patch("/changePincode",isLoggedIn,async(req,res)=>{
        let {pincode}=req.body;
        await User.findByIdAndUpdate(req.user._id,{pincode:pincode});
        req.flash("success",`Pincode changed to ${pincode} successfully.`);
        res.redirect(`/dashboard?role=${req.user.role}`);
});
module.exports=router;
