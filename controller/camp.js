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
    currUser.camps.push(newCamp);
    await currUser.save();
    await newCamp.save();
    req.flash("success","Donation Camp Created Successfully");
    res.redirect("/");

};