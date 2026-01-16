const mongoose=require("mongoose");
const Schema=mongoose.Schema;

emergencyBloodSchema= new Schema({
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
    },
    date:{
        type:Date,
    }
});



module.exports= mongoose.model("EmergencyBlood",emergencyBloodSchema);

 