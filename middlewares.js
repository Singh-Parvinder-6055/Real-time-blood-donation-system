module.exports.isVerified=(req,res,next)=>{
    if(!req.user.isVerified){
        req.flash("error","You are not verified")
        if(!req.user.verification){
            return res.redirect("/getVerified");
        }
        return res.redirect("/");
        
    }
    //console.log(req.user);
    next();
};

module.exports.isOrganization=(req,res,next)=>{
    if(req.user.role!="organization"){
        req.flash("error","You can't get verified")
        return res.redirect("/");
    }
    next();
};

module.exports.isAdmin=(req,res,next)=>{
    if(req.user.role!="admin"){
        req.flash("error","You are not an admin");
        return res.redirect("/");
    }
    next();
};



module.exports.isLoggedIn=(req,res,next)=>{
    
    if(!req.isAuthenticated()){
            // console.log("User is not logged In");
            req.session.redirectUrl=req.originalUrl; //storing the original url in the session because locals do not persist accross redierect(i.e. they remain only for a single request)
            req.flash("error","You Must be logged in to make any changes!");
            return res.redirect("/login"); 
        
    }
    next();
};

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl; 
        //console.log(req.originalUrl);
        
    }
    next();
};

module.exports.isNotAdmin=(req,res,next)=>{
    if(req.user.role==="admin"){
        req.flash("error","Admins cannot donate, donate as a donor");
        return res.redirect("/activeEmergencies");

    }
    next();
};

module.exports.isNotOrganization=(req,res,next)=>{
    if(req.user.role==="organization"){
        req.flash("error","Organizations cannot donate. If you want, donate as a donor");
        return res.redirect("/activeEmergencies");

    }
    next();
};

module.exports.isNotPatient=(req,res,next)=>{
    if(req.user.role==="patient"){
        req.flash("error","Patients cannot donate. If you want, donate as a donor");
        return res.redirect("/activeEmergencies");

    }
    next();
};
