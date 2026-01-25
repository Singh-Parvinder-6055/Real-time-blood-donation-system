const { userSchema } = require("../Schema.js");
const Verification = require("../models/verification.js");
const ExpressError=require("../utils/ExpressError.js");
const Emergency=require("../models/emergency.js");
const Camp=require("../models/camp.js");
const User=require("../models/user.js");
const updateCampStatus=require("../utils/updateCampstatus.js");
const bloodCompatibility=require("../utils/bloodCompatibility.js");

module.exports.renderSignUpForm=(req,res)=>{
    req.session.redirectUrl="/";


let {role}=req.query;
if(!role){
    res.locals.hideNavbar=true;
    return res.render("user/registrationChoice.ejs");
}
if(role=="donor"){
    return res.render("user/signupDonor.ejs");
    // console.log("This worked");
}
if(role=="patient"){
    return res.render("user/signupPatient.ejs");
}
if(role=="organization"){
return res.render("user/signupOrganization.ejs");
}

};


module.exports.signUpUser=async(req,res,next)=>{
    req.session.redirectUrl="/signup";

    
    let { error } = userSchema.validate(req.body.user);
    if(error){
        let errMsg=error.details.map(el=>el.message).join(",");
        //console.log(errMsg);
    
        throw new ExpressError(400,errMsg);
    }
    let password = req.body.user.password;

    let newUser = new User(req.body.user);

let registeredUser= await User.register(newUser, password);
    //console.log(registeredUser);
    req.login(registeredUser,(err)=>{ //this method is used to login a user afer a successfull signup
        if(err){                        //It takes the registeredUuser & a callback function as arguments
            return next(err);
        }
        req.flash("success","Welcome to Blood-Connect!");
        res.redirect("/");
    })
  
};

module.exports.renderLoginForm=(req,res)=>{
    req.session.redirectUrl="/";
    res.locals.hideNavbar=true;
    res.render("user/login.ejs");
};

module.exports.loginUser=(req,res)=>{
                    req.flash("success","Welcome Back!");
                    let redirectUrl=res.locals.redirectUrl ||"/"; //now after the login, the users will either be redirected to the original path they tried to access or to the home page
                    res.redirect(redirectUrl);
};

module.exports.logOutUser=(req,res,next)=>{
        req.session.redirectUrl="/";
        req.logout((err)=>{
        if(err){    
            return next(err);
        }
        req.flash("success","you are logged out");
        res.redirect("/");
    

    })
};

module.exports.visitDashboard=async(req,res)=>{
        await updateCampStatus();
        req.session.redirectUrl="/";
        // let {id}=req.params;
        let {role}=req.query;
        req.session.dashboardRedirect=`/dashboard?role=${role}`;
        if(!role){
            // res.locals.hideNavbar=true;
            res.redirect("/");
        }
        if(role=="donor"){
            let user= await User.findById(req.user._id)
            
            .populate({path:"camps.camp",populate:{path:"organizer"}})
            .populate({path: "emergencies.emergency",populate: [
                        { path: "requestedBy" }, 
                        { path: "patient" }
                    ]
            });

            // if(!user){
            //     req.flash("error","Donor not found");
            //     res.redirect("/");
            // }

            return res.render("dashboards/donorDashboard.ejs",{user});
            
        }

        if(role=="patient"){
            let user= await User.findById(req.user._id)
            .populate({path: "emergencies.emergency",populate: [
                        { path: "requestedBy" }, 
                        { path: "patient" }
                    ]
            });
            // if(!user){
            //     req.flash("error","Patient not found");
            //     res.redirect("/");
            // }
            return res.render("dashboards/patientDashboard.ejs",{user});
        }

        if(role=="organization"){
            let user= await User.findById(req.user._id)
            .populate({path:"camps.camp",populate:{path:"registeredDonors",populate:{path:"donor"}}})
            .populate({path: "emergencies.emergency",populate: [ { path: "patient" }, { path: "requestedBy" }, { path: "fulfilledBy.donor" }]})
            .populate("verification");
        return res.render("dashboards/organizationDashboard.ejs",{user});
        }

        if(role=="admin"){
            let user= await User.findById(req.user._id)
            .populate({path:"camps.camp",populate:{path:"registeredDonors",populate:{path:"donor"}}})
            .populate({path: "emergencies.emergency",populate: [ { path: "patient" }, { path: "requestedBy" }, { path: "fulfilledBy.donor" }]});
            
            // if(!user){ 
            //     req.flash("error","Admin not found");
            //     res.redirect("/");
            // }

            let rejectedOrgs= await Verification.find({verificationStatus:"rejected"}).populate({path:"organization"});
            let verifiedOrgs=await Verification.find({verificationStatus:"approved"}).populate({path:"organization"});
           //console.log(verifiedOrgs);
            return res.render("dashboards/adminDashboard.ejs",{user,rejectedOrgs,verifiedOrgs});
        }
};



module.exports.activeEmergencies = async (req, res) => {
    // 1. Fetch user to get their bloodGroup and already joined emergencies
    let user = await User.findById(req.user._id);
    const joinedIds = user.emergencies.map(item => item.emergency);
    
    // 2. Get the list of compatible recipient groups for this user
    // e.g., if user is O+, compatibleRecipients = ["A+", "B+", "AB+", "O+"]
    const compatibleRecipients = bloodCompatibility[user.bloodGroup] || [];

    // 3. Update query to include blood group matching
    let activeEmergencies = await Emergency.find({
        pincode: req.user.pincode,
        status: "open",
        _id: { $nin: joinedIds },
        bloodGroup: { $in: compatibleRecipients } // Only show what user can donate to
    }).populate({ path: "requestedBy" });

    if (!activeEmergencies.length) {
        req.flash("success", "No compatible active Emergency blood requirements found in your city");
        return res.redirect("/");
    }
    
    res.render("common/activeEmergencies.ejs", { activeEmergencies });
};


module.exports.upcomingCamps=async(req,res)=>{
        await updateCampStatus();
        let user= await User.findById(req.user._id);
        const joinedIds = user.camps.map(item => item.camp);
        
        let upcomingCamps = await Camp.find({status: { $in: ["upcoming", "ongoing"] },pincode: req.user.pincode,_id: { $nin: joinedIds }}).populate("organizer");

        if(!upcomingCamps.length){
                req.flash("success","No upcoming Blood Donation Camps found in your city");
                return res.redirect("/");
        }

        res.render("common/upcomingCamps.ejs",{upcomingCamps});
};

module.exports.activeEmergenciesWithPincode=async(req,res)=>{
        let {pincode}=req.query;
        if(!pincode){
                req.flash("error","Please enter a pincode");
                return res.redirect("/");
        }
        let activeEmergencies= await Emergency.find({status:"open",pincode:pincode}).populate({path:"requestedBy"});
        if(!activeEmergencies.length){
                req.flash("success","No active Emergency blood requirement found in your city");
                return res.redirect("/");
        }
        res.render("common/activeEmergencies.ejs",{activeEmergencies});
};

module.exports.changePincode=async(req,res)=>{
        let {pincode}=req.body;
        await User.findByIdAndUpdate(req.user._id,{pincode:pincode});
        req.flash("success",`Pincode changed to ${pincode} successfully.`);
        res.redirect(`/dashboard?role=${req.user.role}`);
};