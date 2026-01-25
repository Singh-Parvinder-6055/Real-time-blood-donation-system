const Camp=require("../models/camp.js");
const {campSchema}=require("../Schema.js");
const User=require("../models/user.js");
const ExpressError=require("../utils/ExpressError.js");
const updateCampStatus= require("../utils/updateCampstatus.js");


module.exports.renderCreateCampForm=(req,res)=>{
    req.session.redirectUrl="/";
    res.render("camp/createCamp.ejs");
};

module.exports.createCamp=async(req,res)=>{
    req.session.redirectUrl="/camp";
    let camp=req.body.camp;
    let currUser= await User.findById(req.user._id);
    if(!currUser){
        req.flash("error","User not found");
        res.redirect("/");
    }
    camp.organizer=req.user._id.toString();
    let {error}=campSchema.validate(camp);
    if(error){
    let errMsg=error.details.map(el=>el.message).join(",");
    //console.log(errMsg);
    
        throw new ExpressError(400,errMsg);
    }
    let newCamp= new Camp(camp);
    currUser.camps.push({camp:newCamp});
    await currUser.save();
    await newCamp.save();
    req.flash("success","Donation Camp Created Successfully");
    res.redirect("/");

};

module.exports.renderEditCampForm=async(req,res)=>{

        await updateCampStatus();
        let camp= await Camp.findById(req.params.id);
        if(!camp){
                req.flash("error","camp not found");
                return res.redirect(`/dashboard?role=${req.user.role}`);
        }
        if(camp.status=="ongoing"|| camp.status==="completed"){
                req.flash("error",`camp is ${camp.status}, therefore, cannot be edited`);
                return res.redirect(`/dashboard?role=${req.user.role}`);
        }
        res.render("camp/editCamp.ejs",{camp});
};

module.exports.editCamp=async(req,res)=>{
        await updateCampStatus();
        let camp= await Camp.findById(req.params.id);
        if(!camp){
                req.flash("error","camp not found");
                return res.redirect(`/dashboard?role=${req.user.role}`);
        }
        if(camp.status=="ongoing"|| camp.status==="completed"){
                req.flash("error",`camp is ${camp.status}, therefore, cannot be edited`);
                return res.redirect(`/dashboard?role=${req.user.role}`);
        }
        
        await Camp.findByIdAndUpdate(camp._id,{...req.body.camp},{runValidators:true});
        req.flash("success","Camp Updated Successfully");
        return res.redirect(`/dashboard?role=${req.user.role}`);
};

module.exports.deleteCamp=async(req,res)=>{
        await updateCampStatus();
        let camp=await Camp.findById(req.params.id);
        if(!camp){
                req.flash("error","Camp not found");
                return res.redirect(`/dashboard?role=${req.user.role}`);
        }
        if(camp.status==="ongoing"|| camp.status==="completed"){
                req.flash("error",`This camp is ${camp.status} , therefore, cannot be deleted.`);
               return res.redirect(`/dashboard?role=${req.user.role}`);
        }
        
        await User.updateMany({ "camps.camp": req.params._id },{ $pull: { camps: { camp: req.params._id } } });

        await User.findByIdAndUpdate(camp.organizer,{$pull:{camps:{camp:camp._id}}});     
        await Camp.findByIdAndDelete(camp._id);
        req.flash("success","Camp deleted successfully");
        res.redirect(`/dashboard?role=${req.user.role}`);
};

module.exports.participateInCamp=async(req,res)=>{
        await updateCampStatus();
        let camp= await Camp.findById(req.params.id);
        let user= await User.findById(req.user._id);
        if(req.user.role=="admin"||req.user.role=="organizatio"){
                req.flash("error",`${req.user.role}s cannot participate in Camps`);
                return res.redirect("/upcomingCamps");
        }

        // Check if a User exists who already has this emergency ID in their list
        // This checks: "Find the user AND make sure they have this specific emergency ID"
        const alreadyRegistered = await User.findOne({_id: req.user._id,"camps.camp": req.params.id});

        if (alreadyRegistered) {
                req.flash("error", "You have already registerd for this Camp.");
                return res.redirect("/upcomingCamps");
        }
        

        if(!camp){
                req.flash("error","Camp not found");
                return res.redirect("/upcomingCamps");
        }
        if(camp.status==="completed"){
                req.flash("error","Camp is expired");
                return res.redirect("/upcomingCamps");
        }
        
        
        camp.registeredDonors.push({donor:user});
        user.camps.push({camp:camp});
        await camp.save();
        await user.save();

        req.flash("success","Successfully participated in donation camp");
        res.redirect("/upcomingCamps");
};


module.exports.cancelParticipation=async(req,res)=>{
        
        let {id}=req.params;
                let camp = await Camp.findById(id).populate("registeredDonors.donor");
        
                
                if(!camp){
                        req.flash("error","Camp not found");
                         return res.redirect(`/dashboard?role=${req.user.role}`);
                }
        
                let user = camp.registeredDonors.find(d =>
                                        d.donor._id.equals(req.user._id)
                                 );
                if (!user) {
                        req.flash("error", "You have not registered for this camp");
                        return res.redirect(`/dashboard?role=${req.user.role}`);
                }
        
                // console.log(user);
                if(user.isCollected){
                        req.flash("error","You have already donated blood, therefore, cannot cancel it");
                        return res.redirect(`/dashboard?role=${req.user.role}`);
                }
                 
                
                
        
                await Camp.findByIdAndUpdate(id, {                            
                                
                                $pull: { registeredDonors: { donor: req.user._id } } // Atomic array removal
                        });
                
                await User.findByIdAndUpdate(req.user._id,{$pull:{camps:{camp:camp._id}}});
                
                
                req.flash("success","Camp registration cancelled successfully");
                res.redirect(`/dashboard?role=${req.user.role}`);
};

module.exports.collecBloodInCamp=async(req,res)=>{
        await updateCampStatus();
        let{uId,cId}=req.params;        
        let camp=await Camp.findById(cId);
        if(camp.status==="upcoming"){
                req.flash("error", "Blood cannot be collected before the camp starts");
                return res.redirect(`/dashboard?role=${req.user.role}`);
        }
        if(camp.status==="completed"){
                req.flash("error", "The camp has been ended");
                return res.redirect(`/dashboard?role=${req.user.role}`);
        }
        const userResult=await User.updateOne({_id: uId,"camps.camp": cId}, // This part "finds" the correct index
                             {$set: { "camps.$.donated": true } // The '$' uses the index found above
                        });
        // If the ID was fake or the link doesn't exist, matchedCount will be 0
        if (userResult.matchedCount === 0) {
                req.flash("error", "Invalid User ID or Camp ID");
                return res.redirect(`/dashboard?role=${req.user.role}`);
        }
        await Camp.updateOne({_id:cId,"registeredDonors.donor":uId},
                                  {$set:{"registeredDonors.$.isCollected":true, //this $ refers to the above donor
                                         
                                  }
                                });
        req.flash("success","Blood Collected Successfully");
        res.redirect(`/dashboard?role=${req.user.role}`);
};

module.exports.denyDonorRegistrationForCamp=async(req,res)=>{
        let {uId,cId}=req.params;
                let camp = await Camp.findById(cId).populate("registeredDonors.donor");
                let campDonor= await User.findById(uId);
        
                
                if(!camp){
                        req.flash("error","Camp not found");
                         return res.redirect(`/dashboard?role=${req.user.role}`);
                }
        
                let user = camp.registeredDonors.find(d =>
                                        d.donor._id.equals(campDonor._id)
                                 );
                if (!user) {
                        req.flash("error", "This donor not registered for this camp");
                        return res.redirect(`/dashboard?role=${req.user.role}`);
                }
        
                // console.log(user);
                if(user.isCollected){
                        req.flash("error","Blood Has alrady been collected, therefore, cannot deny registration");
                        return res.redirect(`/dashboard?role=${req.user.role}`);
                }
                
                
        
                await Camp.findByIdAndUpdate(cId, {                            
                                
                                $pull: { registeredDonors: { donor: campDonor._id } } // Atomic array removal
                        });
                
                await User.findByIdAndUpdate(campDonor._id,{$pull:{camps:{camp:camp._id}}});
                
                
                req.flash("success",`Registration for ${campDonor.username} is denied successfully.`);
                res.redirect(`/dashboard?role=${req.user.role}`);
};