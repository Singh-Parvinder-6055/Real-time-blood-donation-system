const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose").default;

donorSchema= new Schema({
    fullName:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true,
        min:16
    },
    mobile:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        required:true
    },    
    lastDonated:{
        type:Date,
        default:null
    },
    bloodGroup:{
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
    }
});

donorSchema.plugin(passportLocalMongoose);

module.exports= mongoose.model("Donor",donorSchema);

 