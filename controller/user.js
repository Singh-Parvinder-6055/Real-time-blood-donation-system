const { userSchema } = require("../Schema.js");
const User=require("../models/user.js");
const Verification = require("../models/verification.js");


module.exports.renderSignUpForm=(req,res)=>{


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


module.exports.signUpUser=async(req,res)=>{
try{
    
    let { error } = userSchema.validate(req.body.user);
    if (error) {
        return res.status(400).send(error);
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
}catch(err){
    req.flash("error",err.message);
    res.redirect("/signup");
}   
};

module.exports.renderLoginForm=(req,res)=>{
    res.locals.hideNavbar=true;
    res.render("user/login.ejs");
};

module.exports.loginUser=(req,res)=>{
                    req.flash("success","Welcome Back!");
                    let redirectUrl=res.locals.redirectUrl ||"/"; //now after the login, the users will either be redirected to the original path they tried to access or to the home page
                    res.redirect(redirectUrl);
};

module.exports.logOutUser=(req,res,next)=>{
        req.logout((err)=>{
        if(err){    
            return next(err);
        }
        req.flash("success","you are logged out");
        res.redirect("/");
    

    })
};

module.exports.visitDashboard=async(req,res)=>{
        let {id}=req.params;
        let {role}=req.query;
        if(!role){
            res.locals.hideNavbar=true;
            return res.render("/");
        }
        if(role=="donor"){
            let user= await User.findById(id)
            .populate({path:"camps",populate:{path:"organizer"}})
            .populate({path: "emergencies",populate: [
                        { path: "requestedBy" }, 
                        { path: "patient" }
                    ]
            });

            return res.render("dashboards/donorDashboard.ejs",{user});
            
        }

        if(role=="patient"){
            let user= await User.findById(id)
            .populate({path: "emergencies",populate: [
                        { path: "requestedBy" }, 
                        { path: "patient" }
                    ]
            });

            return res.render("dashboards/patientDashboard.ejs",{user});
        }

        if(role=="organization"){
        return res.render("dashboards/organizationDashboard.ejs");
        }
        
        if(role=="admin"){
            let user= await User.findById(id)
            .populate({path:"camps",populate:{path:"organizer"}})
            .populate({path: "emergencies",populate: [
                        { path: "requestedBy" }, 
                        { path: "patient" }
                    ]
            });
            

            let rejectedOrgs= await Verification.find({verificationStatus:"rejected"}).populate({path:"organization"});
            let verifiedOrgs=await Verification.find({verificationStatus:"approved"}).populate({path:"organization"});
           //console.log(verifiedOrgs);
            return res.render("dashboards/adminDashboard.ejs",{user,rejectedOrgs,verifiedOrgs});
        }
};