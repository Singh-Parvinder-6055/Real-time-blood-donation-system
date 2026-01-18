const express=require("express");
const router=express.Router();
const {isVerified}=require("../middlewares");
const {isLoggedIn}=require("../middlewares");
const Camp=require("../models/camp");
const {campSchema}=require("../Schema");

router.get("/camp",isLoggedIn,isVerified,(req,res)=>{
    res.render("camp/createCamp.ejs");
});

router.post("/camp",isLoggedIn,isVerified,async(req,res)=>{
    let camp=req.body.camp;
    camp.organizer=req.user._id.toString();
    let {error}=campSchema.validate(camp);
    if(error){
        return res.status(400).send(error);
    }
    let newCamp= await new Camp(camp);
    await newCamp.save();
    req.flash("success","Donation Camp Created Successfully");
    res.redirect("/");
});



module.exports=router;