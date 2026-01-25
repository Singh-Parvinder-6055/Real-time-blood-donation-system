if(process.env.NODE_ENV !="production"){
    require('dotenv').config();

}

const { userSchema } = require("../Schema.js");
const User=require("../models/user.js");
const Verification = require("../models/verification.js");
const ExpressError=require("../utils/ExpressError.js");
const jwt=require("jsonwebtoken");


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
                    const user = req.user;
                         
                        //  adding jwt token for authentication of user
                        const token = jwt.sign({

                            id: user._id,
                            role: user.role
                            },
                            process.env.JWT_SECRET,
                           { expiresIn: "1d" }
                        );
                        // console.log(token);

                        // store jwt token in cookie ,temporary
                        res.cookie("token", token, {
                           httpOnly: false,
                           sameSite: "lax"
                        });
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
        
        req.session.redirectUrl="/";
        let {id}=req.params;
        let {role}=req.query;
        req.session.dashboardRedirect=`/dashboard/${id}?role=${role}`;
        if(!role){
            // res.locals.hideNavbar=true;
            res.redirect("/");
        }
        if(role=="donor"){
            let user= await User.findById(id)
            
            .populate({path:"camps",populate:{path:"organizer"}})
            .populate({path: "emergencies",populate: [
                        { path: "requestedBy" }, 
                        { path: "patient" }
                    ]
            });

            if(!user){
                req.flash("error","Donor not found");
                res.redirect("/");
            }

            return res.render("dashboards/donorDashboard.ejs",{user});
            
        }

        if(role=="patient"){
            let user= await User.findById(id)
            .populate({path: "emergencies",populate: [
                        { path: "requestedBy" }, 
                        { path: "patient" }
                    ]
            });
            if(!user){
                req.flash("error","Patient not found");
                res.redirect("/");
            }
            return res.render("dashboards/patientDashboard.ejs",{user});
        }

        if(role=="organization"){
            let user= await User.findById(id)
            .populate({path:"camps"})//.populate({path:"camps",populate:{path:"organizer"}})
            .populate({path: "emergencies",populate:{ path: "patient" }})
            .populate({path:"verification"});
        return res.render("dashboards/organizationDashboard.ejs",{user});
        }

        if(role=="admin"){
            let user= await User.findById(id)
            .populate({path:"camps"})//.populate({path:"camps",populate:{path:"organizer"}})
            .populate({path: "emergencies",populate:{ path: "patient" }});
            
            if(!user){ 
                req.flash("error","Admin not found");
                res.redirect("/");
            }

            let rejectedOrgs= await Verification.find({verificationStatus:"rejected"}).populate({path:"organization"});
            let verifiedOrgs=await Verification.find({verificationStatus:"approved"}).populate({path:"organization"});
           //console.log(verifiedOrgs);
            return res.render("dashboards/adminDashboard.ejs",{user,rejectedOrgs,verifiedOrgs});
        }
};