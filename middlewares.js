module.exports.isVerified=(req,res,next)=>{
    if(!req.user.isVerified ||req.user.role!="admin"){
        req.flash("error","You are not verified")
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
            console.log("User is not logged In");
            //req.session.redirectUrl=req.originalUrl; //storing the original url in the session because locals do not persist accross redierect(i.e. they remain only for a single request)
            req.flash("error","You Must be logged in to make any changes!");
            return res.redirect("/login"); 
        
    }
    next();
};