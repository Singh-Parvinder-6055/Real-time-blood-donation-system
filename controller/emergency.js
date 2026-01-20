const Emergency=require("../models/emergency.js");
const User=require("../models/user.js");
const {emergencySchema}=require("../Schema.js");
const ExpressError=require("../utils/ExpressError.js");



module.exports.renderCreateEmergencyForm=(req,res)=>{
    req.session.redirectUrl="/";
    res.render("emergency/createEmergency.ejs");
};

module.exports.createEmergency=async(req,res)=>{
    req.session.redirectUrl="/emergency";
    
        
        let currUser= await User.findById(req.user._id);
        if(!currUser){
            req.flash("error","User not found");
            res.redirect("/emergency");
        }
        let emergency=req.body.emergency;
        let patientUsername=emergency.patient;
        let patientExists= await User.findOne({username:patientUsername});
        // console.log(patientExists);
        if(patientExists==null || patientExists.role!=="patient"){
            req.flash("error","patient does not exists");
            return res.redirect("/emergency");
           
        }else{
            req.flash("success","patient exists");
        }
        if(patientExists.patientBloodGroup!==emergency.bloodGroup){
            req.flash("error","Pateint blood group does not match the provided blood group");
            return res.redirect("/emergency");
        }
        
        emergency.requestedBy=currUser._id.toString();
        emergency.patient=patientExists._id.toString();
        emergency.city=currUser.city;
        emergency.pincode=currUser.pincode;
        
        //emergency.createdAt= new Date();
        let { error } = emergencySchema.validate(emergency);
        if(error){
            let errMsg=error.details.map(el=>el.message).join(",");
            //console.log(errMsg);
    
        throw new ExpressError(400,errMsg);
        }

        let newEmergency= new Emergency(emergency);
        patientExists.emergencies.push(newEmergency);
        
        currUser.emergencies.push(newEmergency);
        await newEmergency.save();
        await patientExists.save();
        await currUser.save();
        req.flash("success","Emergency Blood requirement Created Successfully!");
        res.redirect("/");
   
};