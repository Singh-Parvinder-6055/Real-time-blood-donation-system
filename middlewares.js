const jwt = require("jsonwebtoken");

module.exports.isVerified=(req,res,next)=>{
    if(!req.user.isVerified){
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



module.exports.socketAuth = (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("No token"));

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = user; // attach user
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
};
