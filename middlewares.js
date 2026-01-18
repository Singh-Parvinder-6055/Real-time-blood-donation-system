module.exports.isVerified=(req,res,next)=>{
    if(!req.user.isVerified ||req.user.role!="admin"){
        return res.send("You are not verified");
    }
    //console.log(req.user);
    next();
};

module.exports.isLoggedIn=(req,res,next)=>{
    
    if(!req.isAuthenticated()){
            console.log("User is not logged In");
            //req.session.redirectUrl=req.originalUrl; //storing the original url in the session because locals do not persist accross redierect(i.e. they remain only for a single request)
            //req.flash("error","You Must be logged in to make any changes!");
            return res.redirect("/login"); 
        
    }
    next();
};