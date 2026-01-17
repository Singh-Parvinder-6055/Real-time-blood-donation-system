const express=require("express");
const router=express.Router();

router.get("/emergency",(req,res)=>{
    res.render("emergency/emergencyRequirement.ejs");
});

router.get("/showEmergency",(req,res)=>{
    res.render("emergency/showEmergency.ejs");
});

module.exports=router;