const express=require("express");
const router=express.Router();
const {isVerified}=require("../middlewares");
const {isLoggedIn}=require("../middlewares");
const {emergencySchema}=require("../Schema");
const Emergency=require("../models/emergency");
const User=require("../models/user");
const { getIO } = require("../io");


router.get("/emergency",isLoggedIn,isVerified,(req,res)=>{
    res.render("emergency/createEmergency.ejs");
});

router.post("/emergency",isLoggedIn,isVerified,async(req,res)=>{
    try{ 
        let id=res.locals.currUser._id;
        let currUser= await User.findById(id);
        let emergency=req.body.emergency;
        let patientUsername=emergency.patient;
        let patientExists= await User.findOne({username:patientUsername});
        console.log(patientExists);
        if(!patientExists || patientExists.role!=="patient"){
            req.flash("error","patient does not exists");
            return res.redirect("/emergency");
           
        }
        if(patientExists.patientBloodGroup!==emergency.bloodGroup){
            req.flash("error","Pateint blood group does not match the provided blood group");
            return res.redirect("/emergency");
        }
        
        emergency.requestedBy=currUser._id.toString();
        emergency.patient=patientExists._id.toString();
        emergency.city=currUser.city;
        console.log(patientExists.patientBloodGroup, emergency.bloodGroup);

        
        //emergency.createdAt= new Date();
        let { error } = emergencySchema.validate(emergency);
                if (error) {
                  req.flash("error", error.details[0].message);
                  return res.redirect("/emergency");
                }

        let newEmergency= new Emergency(emergency);
        patientExists.emergencies.push(newEmergency);
        currUser.emergencies.push(newEmergency);
        await newEmergency.save();
        await patientExists.save();
        await currUser.save();
        req.flash("success","Emergency Blood requirement Created Successfully!");
         getIO().to("donors").emit("blood_request", {
            requestId: newEmergency._id,            
            bloodGroup: newEmergency.bloodGroup,   
            units: newEmergency.unitsRequired,      
            hospital: {
            id: currUser._id,
            name: currUser.username,
            city: currUser.city
            },
            time: new Date()
            });

        res.redirect("/");
    }
    catch(err){
        console.error(err);
        req.flash("error", err.message);
        res.redirect("/emergency");
    }
});
// router.get("/showEmergency",(req,res)=>{
//     res.render("emergency/showEmergency.ejs");
// });

module.exports=router;