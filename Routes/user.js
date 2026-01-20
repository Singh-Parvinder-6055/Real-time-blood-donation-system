const express=require("express");
const router=express.Router();
const passport=require("passport");
const {isLoggedIn,saveRedirectUrl}=require("../middlewares.js");
const userController=require("../controller/user.js");
const wrapAsync=require("../utils/wrapAsync");


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



router.get("/dashboard/:id",isLoggedIn,wrapAsync(userController.visitDashboard));


module.exports=router;
