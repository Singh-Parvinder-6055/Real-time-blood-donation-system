const express=require("express");
const router=express.Router();
const passport=require("passport");
const {isLoggedIn,saveRedirectUrl}=require("../middlewares.js");
const userController=require("../controller/user.js");
const wrapAsync=require("../utils/wrapAsync");
const Emergency=require("../models/emergency.js");
const Camp=require("../models/camp.js");

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

router.get("/activeEmergencies",async(req,res)=>{
        let activeEmergencies=await Emergency.find({status:"open"}).populate({path:"requestedBy"});
        res.render("common/activeEmergencies.ejs",{activeEmergencies});
});

router.get("/upcomingCamps",async(req,res)=>{
        let upcomingCamps= await Camp.find({status:"upcoming"});
        res.render("common/upcomingCamps.ejs",{upcomingCamps});
});

module.exports=router;
