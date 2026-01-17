const express=require("express");
const app= express();
const mongoose=require("mongoose");
const path=require("path");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const session=require("express-session");
const userRouter=require("./Routes/user");
const emergencyRouter=require("./Routes/emergency");
const User=require("./models/user");
const ejsMate=require("ejs-Mate");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true})); //to see the data sent in the body of request 
app.use(express.json());
//app.use(methodOverride('_method'));//to use delete,put & patch methods using forms
app.use(express.static(path.join(__dirname,"public")));
app.engine("ejs",ejsMate);

const sessionOptions={
    secret:"mySecret", //very weak secret
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true
    }
};

app.use(session(sessionOptions));
//app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); //this is used for authentication, If we don't use it, user won't be authenticated during login
passport.serializeUser(User.serializeUser()); //to store user's info in the session, this is automatically used by the passport
passport.deserializeUser(User.deserializeUser());//to delete user's info from the session, this is automatically used by the passport 



app.listen(8080,()=>{
    console.log("Listening on port 8080");
});

async function Main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/bloodDonation');
}

Main().then(()=>{console.log("connected to database");}).catch(err=>{console.log(err);});

app.get("/",(req,res)=>{
    // if(req.session.count){
    //     req.session.count++;
    //     }
    // else{
    //     req.session.count=1;
    // }
    // res.send(`you sent request ${req.session.count} times`);
res.render("common interface/index.ejs");
});

app.use("/",userRouter);
app.use("/",emergencyRouter);

