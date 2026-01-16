const express=require("express");
const app= express();
const mongoose=require("mongoose");
const path=require("path");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const session=require("express-session");
const Donor=require("./models/donor.js");
const { donorSchema } = require("./Schema.js");
const Organization=require("./models/organization.js");
const {organizationSchema}=require("./Schema.js");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true})); //to see the data sent in the body of request 
app.use(express.json());
//app.use(methodOverride('_method'));//to use delete,put & patch methods using forms
app.use(express.static(path.join(__dirname,"public")));

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
passport.use(new LocalStrategy(Donor.authenticate())); //this is used for authentication, If we don't use it, user won't be authenticated during login
passport.serializeUser(Donor.serializeUser()); //to store user's info in the session, this is automatically used by the passport
passport.deserializeUser(Donor.deserializeUser());//to delete user's info from the session, this is automatically used by the passport 



app.listen(8080,()=>{
    console.log("Listening on port 8080");
});

async function Main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/bloodDonation');
}

Main().then(()=>{console.log("connected to database");}).catch(err=>{console.log(err);});

app.get("/",(req,res)=>{
    if(req.session.count){
        req.session.count++;
        }
    else{
        req.session.count=1;
    }
    res.send(`you sent request ${req.session.count} times`);

});

app.get("/signup/donor",(req,res)=>{
    res.render("donor/signup");
});

app.post("/signup/donor",async(req,res)=>{
    let{error}= donorSchema.validate(req.body);
    if(error){
        res.send(error);
    }
    let password= req.body.donor.password;
    
    let newDonor= new Donor(req.body.donor);
    let registeredDonor= await Donor.register(newDonor, password);
        console.log(registeredDonor);
        req.login(registeredDonor,(err)=>{ //this method is used to login a user afer a successfull signup
            if(err){                        //It takes the registeredUuser & a callback function as arguments
                res.send(err);
            }
            
        })
    });

app.get("/signup/organization",(req,res)=>{
    res.render("organization/signup");
});

app.post("/signup/organization",async(req,res)=>{
    let{error}= organizationSchema.validate(req.body);
    if(error){
        res.send(error);
    }
    let password= req.body.organization.password;
    
    let newOrganization= new Organization(req.body.organization);
    let registeredOrganization= await Organization.register(newOrganization, password);
        console.log(registeredOrganization);
        req.login(registeredOrganization,(err)=>{ //this method is used to login a user afer a successfull signup
            if(err){                        //It takes the registeredUuser & a callback function as arguments
                res.send(err);
            }
            
        })
    });



