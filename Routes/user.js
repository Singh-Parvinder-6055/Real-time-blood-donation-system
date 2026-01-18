const express=require("express");
const router=express.Router();
const { userSchema } = require("../Schema.js");
const User=require("../models/user.js");
const passport=require("passport");


router.get("/signup",(req,res)=>{
    
    let {role}=req.query;
    if(!role){
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

router.post("/signup",async(req,res)=>{
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
    res.render("user/login.ejs");
});

router.post("/login",passport.authenticate('local',  //the passport.authenticate() internally calls req.login(user)  and passes the user after accessing the user from req.user
                    {failureRedirect:'/login', 
                    failureFlash:true}),(req,res)=>{
                        req.flash("success","Welcome Back!");
                        res.redirect("/");
                    }
);

router.get("/logout",async(req,res)=>{
    await req.logout((err)=>{
        if(err){    
            next(err);
        }
        req.flash("success","you are logged out");
        res.redirect("/");
    

    })
});

module.exports=router;
