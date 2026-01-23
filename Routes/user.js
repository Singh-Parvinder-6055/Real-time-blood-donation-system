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



router.get("/dashboard/:id",isLoggedIn,wrapAsync(userController.visitDashboard));

router.get("/activeEmergencies/:id",async(req,res)=>{
        let {id}=req.params;
        let user= await User.findById(id);
        if(!user){
                req.flash("error","you are not logged in");
                return res.redirect("/");
        }
        let activeEmergencies=await Emergency.find({status:"open",pincode:user.pincode}).populate({path:"requestedBy"});
        if(!activeEmergencies.length){
                req.flash("success","No active Emergency blood requirement found in your city");
                return res.redirect("/");
        }
        res.render("common/activeEmergencies.ejs",{activeEmergencies});
});

router.get("/upcomingCamps/:id",isLoggedIn,async(req,res)=>{
        
        
        let upcomingCamps = await Camp.find({status: { $in: ["upcoming", "ongoing"] },pincode: req.user.pincode}).populate("organizer");

        if(!upcomingCamps.length){
                req.flash("success","No upcoming Blood Donation Camps found in your city");
                return res.redirect("/");
        }

        res.render("common/upcomingCamps.ejs",{upcomingCamps});
});

router.get("/activeEmergencies",async(req,res)=>{
        let {pincode}=req.query;
        if(!pincode){
                req.flash("error","Please enter a pincode");
                return res.redirect("/");
        }
        let activeEmergencies= await Emergency.find({status:"open",pincode:pincode}).populate({path:"requestedBy"});
        if(!activeEmergencies.length){
                req.flash("success","No active Emergency blood requirement found in your city");
                return res.redirect("/");
        }
        res.render("common/activeEmergencies.ejs",{activeEmergencies});
})

module.exports=router;
