const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose").default;

organizationSchema= new Schema({
    organizationName:{
        type:String,
        required:true
    },
    typeOfOrganization:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        required:true
    },    
    country:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    owner:{
        type:String,
        required:true
    },
   // timing:TimeRanges
});

organizationSchema.plugin(passportLocalMongoose);

module.exports= mongoose.model("Organization",organizationSchema);

 