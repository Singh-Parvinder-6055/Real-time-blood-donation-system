const express=require("express");
const router=express.Router();
const {isVerified}=require("../middlewares");
const {isLoggedIn}=require("../middlewares");
const {emergencySchema}=require("../Schema");
const Emergency=require("../models/emergency");

router.get("/emergency",isLoggedIn,isVerified,(req,res)=>{
    res.render("emergency/createEmergency.ejs");
});

router.post("/emergency",isLoggedIn,isVerified,async(req,res)=>{
    try{
        let currUser=res.locals.currUser;
        let emergency=req.body.emergency;
        emergency.requestedBy=currUser._id.toString();
        emergency.city=currUser.city;
        
        //emergency.createdAt= new Date();
        let { error } = emergencySchema.validate(emergency);
                if (error) {
                    return res.status(400).send(error);
                }
        let newEmergency=await new Emergency(emergency);
        // console.log(`mongoDb ${newEmergency}`);
        await newEmergency.save();
        req.flash("success","Emergency Blood requirement Created Successfully!");
        res.redirect("/");
    }
    catch(err){
        res.send(err);
    }
});
// router.get("/showEmergency",(req,res)=>{
//     res.render("emergency/showEmergency.ejs");
// });

module.exports=router;