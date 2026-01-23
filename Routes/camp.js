const express=require("express");
const router=express.Router({mergeParams:true});
const {isVerified}=require("../middlewares");
const {isLoggedIn}=require("../middlewares");
const campController=require("../controller/camp.js");
const wrapAsync=require("../utils/wrapAsync");
const Camp=require("../models/camp.js");
const User=require("../models/user.js");


router.route("/")
        .get(isLoggedIn,isVerified,campController.renderCreateCampForm)
        .post(isLoggedIn,isVerified,wrapAsync(campController.createCamp));
        
router.get("/edit/:id",isLoggedIn,isVerified,async(req,res)=>{

        let camp= await Camp.findById(req.params.id);
        if(!camp){
                req.flash("error","camp not found");
                return res.redirect(`/dashboard/${req.user._id}?role=${req.user.role}`);
        }
        if(camp.status=="ongoing"|| camp.status==="completed"){
                req.flash("error","camp is completed or ongoing, therefore, cannot be edited");
                return res.redirect(`/dashboard/${req.user._id}?role=${req.user.role}`);
        }
        res.render("camp/editCamp.ejs",{camp});
});

router.patch("/edit/:id",isLoggedIn,isVerified,async(req,res)=>{

        let camp= await Camp.findById(req.params.id);
        if(!camp){
                req.flash("error","camp not found");
                return res.redirect(`/dashboard/${req.user._id}?role=${req.user.role}`);
        }
        if(camp.status=="ongoing"|| camp.status==="completed"){
                req.flash("error","camp is completed or ongoing, therefore, cannot be edited");
                return res.redirect(`/dashboard/${req.user._id}?role=${req.user.role}`);
        }
        
        await Camp.findByIdAndUpdate(camp._id,{...req.body.camp},{runValidators:true});
        req.flash("success","Camp Updated Successfully");
        return res.redirect(`/dashboard/${req.user._id}?role=${req.user.role}`);
});


router.delete("/:id",async(req,res)=>{
        let camp=await Camp.findById(req.params.id);
        if(!camp){
                req.flash("error","Camp not found");
                return res.redirect(`/dashboard/${req.user._id}?role=${req.user.role}`);
        }
        if(camp.status==="ongoing"|| camp.status==="completed"){
                req.flash("error","This camp is either ongoing or completed, therefore, cannot be deleted.");
               return res.redirect(`/dashboard/${req.user._id}?role=${req.user.role}`);
        }
        let registeredDonors=camp.registeredDonors;
        if(registeredDonors.length){
                for(donor of registeredDonors){
                        await User.findByIdAndUpdate(donor,{$pull:{camps:camp._id}});    
                }
        }

        await User.findByIdAndUpdate(camp.organizer,{$pull:{camps:camp._id}});     
        await Camp.findByIdAndDelete(camp._id);
        req.flash("success","Camp deleted successfully");
        res.redirect(`/dashboard/${req.user._id}?role=${req.user.role}`);
});

module.exports=router;