const Camp=require("../models/camp.js");
const {campSchema}=require("../Schema.js");
const User=require("../models/user.js");
const ExpressError=require("../utils/ExpressError.js");


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

        let camp= await Camp.findById(req.params.id);
        if(!camp){
                req.flash("error","camp not found");
                return res.redirect(`/dashboard?role=${req.user.role}`);
        }
        if(camp.status=="ongoing"|| camp.status==="completed"){
                req.flash("error","camp is completed or ongoing, therefore, cannot be edited");
                return res.redirect(`/dashboard?role=${req.user.role}`);
        }
        res.render("camp/editCamp.ejs",{camp});
};

module.exports.editCamp=async(req,res)=>{

        let camp= await Camp.findById(req.params.id);
        if(!camp){
                req.flash("error","camp not found");
                return res.redirect(`/dashboard?role=${req.user.role}`);
        }
        if(camp.status=="ongoing"|| camp.status==="completed"){
                req.flash("error","camp is completed or ongoing, therefore, cannot be edited");
                return res.redirect(`/dashboard?role=${req.user.role}`);
        }
        
        await Camp.findByIdAndUpdate(camp._id,{...req.body.camp},{runValidators:true});
        req.flash("success","Camp Updated Successfully");
        return res.redirect(`/dashboard?role=${req.user.role}`);
};

module.exports.deleteCamp=async(req,res)=>{
        let camp=await Camp.findById(req.params.id);
        if(!camp){
                req.flash("error","Camp not found");
                return res.redirect(`/dashboard?role=${req.user.role}`);
        }
        if(camp.status==="ongoing"|| camp.status==="completed"){
                req.flash("error","This camp is either ongoing or completed, therefore, cannot be deleted.");
               return res.redirect(`/dashboard?role=${req.user.role}`);
        }
        let registeredDonors=camp.registeredDonors;
        if(registeredDonors.length){
                for(donor of registeredDonors){
                        await User.findByIdAndUpdate(donor.donor,{$pull: {camps: { camp: camp._id }}});
    
                }
        }

        await User.findByIdAndUpdate(camp.organizer,{$pull:{camps:{camp:camp._id}}});     
        await Camp.findByIdAndDelete(camp._id);
        req.flash("success","Camp deleted successfully");
        res.redirect(`/dashboard/${req.user._id}?role=${req.user.role}`);
};