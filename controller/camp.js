const Camp=require("../models/camp.js");
const {campSchema}=require("../Schema.js");
const User=require("../models/user.js");


module.exports.renderCreateCampForm=(req,res)=>{
    res.render("camp/createCamp.ejs");
};

module.exports.createCamp=async(req,res)=>{
    let camp=req.body.camp;
    let currUser= await User.findById(req.user._id);
    camp.organizer=req.user._id.toString();
    let {error}=campSchema.validate(camp);
    if(error){
        return res.status(400).send(error);
    }
    let newCamp= new Camp(camp);
    currUser.camps.push(newCamp);
    await currUser.save();
    await newCamp.save();
    req.flash("success","Donation Camp Created Successfully");
    res.redirect("/");
};