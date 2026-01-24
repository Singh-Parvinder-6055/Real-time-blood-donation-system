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
        res.redirect("/");
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
        patientExists.emergencies.push({ emergency: newEmergency });

        currUser.emergencies.push({emergency:newEmergency});
        await newEmergency.save();
        await patientExists.save();
        await currUser.save();
        req.flash("success","Emergency Blood requirement Created Successfully!");
        res.redirect("/");
   
};

module.exports.destroyEmergency=async(req,res)=>{
        let{id}=req.params;
        let emergency=await Emergency.findById(id);
        if(!emergency){
                req.flash("error","No emergency request found");
                return res.redirect(`/dashboard?role=${req.user.role}`);
        }
        if(emergency.isFulfilled){
                req.flash("error","This emergency request is fulfilled, and cannot be deleted.");
               return res.redirect(`/dashboard?role=${req.user.role}`);
        }        
        
        await User.updateMany({ "emergencies.emergency": id },{ $pull: { emergencies: { emergency: id } } }); // Find every user who has this emergency                                                                                                                  // Pull it from their array
            

        await Emergency.findByIdAndDelete(id);
        req.flash("success","Emergency request deleted successfully");
        res.redirect(`/dashboard?role=${req.user.role}`);
};

module.exports.fulfillEmergency=async(req,res)=>{
        let {id}=req.params;
        let emergency= await Emergency.findById(id);
        let user= await User.findById(req.user._id);

        // Check if a User exists who already has this emergency ID in their list
        // This checks: "Find the user AND make sure they have this specific emergency ID"
        const alreadySignedUp = await User.findOne({_id: req.user._id,"emergencies.emergency": id});

        if (alreadySignedUp) {
                req.flash("error", "You have already signed up for this emergency.");
                return res.redirect("/activeEmergencies");
        }
        

        if(!emergency){
                req.flash("error","Emergency not found");
                return res.redirect("/activeEmergencies");
        }
        if(emergency.status==="fulfilled"){
                req.flash("error","Required Units already collected");
                return res.redirect("/activeEmergencies");
        }
          
        
        emergency.unitsCollected++;
        if(emergency.unitsRequired==emergency.unitsCollected){
                 emergency.status="fulfilled";
        }
        emergency.fulfilledBy.push({donor:user});
        user.emergencies.push({emergency:emergency});
        await emergency.save();
        await user.save();

        req.flash("success","Successfully Registered for emergency donation");
        res.redirect("/");
};

module.exports.cancelFulfillEmergency=async(req,res)=>{
        let {id}=req.params;
        let emergency = await Emergency.findById(id).populate("fulfilledBy.donor");

        
        if(!emergency){
                req.flash("error","Emergency not found");
                return res.redirect("/activeEmergencies");
        }

        let user = emergency.fulfilledBy.find(d =>
                                d.donor._id.equals(req.user._id)
                         );
        if (!user) {
                req.flash("error", "You are not assigned to this emergency");
                return res.redirect(`/dashboard?role=${req.user.role}`);
        }

        console.log(user);
        if(user.isCollected){
                req.flash("error","You have already donated blood, therefore, cannot cancel it");
                return res.redirect(`/dashboard?role=${req.user.role}`);
        }
        // emergency.unitsCollected--;
        // if(emergency.unitsRequired>emergency.unitsCollected){
        //          emergency.status="open";
        // }
        const newStatus = (emergency.unitsCollected - 1 < emergency.unitsRequired) ? "open" : "fulfilled";

        await Emergency.findByIdAndUpdate(id, {
                        $inc: { unitsCollected: -1 }, // Atomic decrement
                        $set: { status: newStatus },   // Atomic status update
                        $pull: { fulfilledBy: { donor: req.user._id } } // Atomic array removal
                });
        
        await User.findByIdAndUpdate(req.user._id,{$pull:{emergencies:{emergency:emergency._id}}});
        
        
        req.flash("success","Fulfill request cancelled successfully");
        res.redirect(`/dashboard?role=${req.user.role}`);
        
        
};