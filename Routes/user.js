if(process.env.NODE_ENV !="production"){
    require('dotenv').config();

}

const express=require("express");
const router=express.Router();
const { userSchema } = require("../Schema.js");
const User=require("../models/user.js");
const passport=require("passport");
const {isLoggedIn,isAdmin, saveRedirectUrl}=require("../middlewares.js");
const jwt = require("jsonwebtoken");



router.get("/signup",(req,res)=>{

    
    let {role}=req.query;
    if(!role){
        res.locals.hideNavbar=true;
        return res.render("user/registrationChoice.ejs");
    }
    if(role=="donor"){
        return res.render("user/signupDonor.ejs");
        console.log("This worked");
    }
    if(role=="patient"){
        return res.render("user/signupPatient.ejs");
    }
    if(role=="organization"){
       return res.render("user/signupOrganization.ejs");
    }
    
});

router.post("/signup",async(req,res,next)=>{
    try{
        
        let { error } = userSchema.validate(req.body.user);
        if (error) {
            return res.status(400).send(error);
        }
        let password = req.body.user.password;

        let newUser = new User(req.body.user);
    let registeredUser= await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser,(err)=>{ //this method is used to login a user afer a successfull signup
            if(err){                        //It takes the registeredUuser & a callback function as arguments
                return next(err);
            }
            req.flash("success","Welcome to Blood-Connect!");
            res.redirect("/");
        })
    }catch(err){
        req.flash("error",err.message);
        res.redirect("/signup");
    }   
    });

router.get("/login",(req,res)=>{
    res.locals.hideNavbar=true;
    res.render("user/login.ejs");
});

router.post("/login",saveRedirectUrl,passport.authenticate('local',  //the passport.authenticate() internally calls req.login(user)  and passes the user after accessing the user from req.user
                    {failureRedirect:'/login', 
                    failureFlash:true}),(req,res)=>{
                        
                         const user = req.user;
                         
                        //  adding jwt token for authentication of user
                        const token = jwt.sign({

                            id: user._id,
                            role: user.role
                            },
                            process.env.JWT_SECRET,
                           { expiresIn: "1d" }
                        );
                        // console.log(token);

                        // store jwt token in cookie ,temporary
                        res.cookie("token", token, {
                           httpOnly: false,
                           sameSite: "lax"
                        });
                        req.flash("success", "Welcome Back!");
                        let redirectUrl=res.locals.redirectUrl ||"/"; //now after the login, the users will either be redirected to the original path they tried to access or to the home page
                        res.redirect(redirectUrl);
                    }
);

router.get("/logout",async(req,res)=>{
    await req.logout((err)=>{
        if(err){    
            next(err);
        }
        res.clearCookie("token");  //after logout it clears the token cookie , prevent reuse of token
        req.flash("success","you are logged out");
        res.redirect("/");
    

    })
});

router.get("/dashboard/:id",isLoggedIn,async(req,res)=>{
    let {id}=req.params;
    let {role}=req.query;
    if(!role){
        res.locals.hideNavbar=true;
        return res.render("/");
    }
    if(role=="donor"){
        return res.render("dashboards/donorDashboard.ejs");
        
    }
    if(role=="patient"){
        return res.render("dashboards/patientDashboard.ejs");
    }
    if(role=="organization"){
       return res.render("dashboards/organizationDashboard.ejs");
    }
    if(role=="admin"){
        let user= await User.findById(id)
        .populate({path:"camps",populate:{path:"organizer"}})

        .populate({path:"emergencies",populate:{path:"requestedBy"}});

        console.log(user);
        return res.render("dashboards/adminDashboard.ejs",{user});
    }
});
module.exports=router;
