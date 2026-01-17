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
    let{error}= userSchema.validate(req.body);
    if(error){
        res.send(error);
    }
    let password= req.body.user.password;
    
    let newUser= new User(req.body.user);
    let registeredUser= await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser,(err)=>{ //this method is used to login a user afer a successfull signup
            if(err){                        //It takes the registeredUuser & a callback function as arguments
                res.send(err);
            }
            
        })
    });

router.get("/login",(req,res)=>{
    res.render("user/login.ejs");
});

router.post("/login",passport.authenticate('local',  //the passport.authenticate() internally calls req.login(user)  and passes the user after accessing the user from req.user
                    {failureRedirect:'/login', 
                    failureFlash:true}),(req,res)=>{
                        res.send("Welcome to Blood-Connect ");
                    }
);

module.exports=router;
