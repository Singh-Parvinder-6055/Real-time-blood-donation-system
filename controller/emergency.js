const Emergency=require("../models/emergency.js");
const User=require("../models/user.js");
const {emergencySchema}=require("../Schema.js");

module.exports.renderCreateEmergencyForm=(req,res)=>{
    res.render("emergency/createEmergency.ejs");
};

module.exports.createEmergency=async(req,res)=>{
    try{
        
        let currUser= await User.findById(req.user._id);
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
        
        //emergency.createdAt= new Date();
        let { error } = emergencySchema.validate(emergency);
                if (error) {
                    return res.status(400).send(error);
                }
        let newEmergency= new Emergency(emergency);
        patientExists.emergencies.push(newEmergency);
        
        currUser.emergencies.push(newEmergency);
        await newEmergency.save();
        await patientExists.save();
        await currUser.save();
        req.flash("success","Emergency Blood requirement Created Successfully!");
        res.redirect("/");
    }
    catch(err){
        res.send(err);
    }
};