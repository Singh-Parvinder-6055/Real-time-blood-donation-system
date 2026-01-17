 const mongoose=require("mongoose");
 const Schema=mongoose.Schema;
 const Organization=require("./organization");

 donationCampSchema= new Schema({
    location:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        required:true
    },
    organizer:{
        type:Schema.Types.ObjectId,
        ref:"Organization"
    }
 });

 module.exports=mongoose.model("DonationCamp",donationCampSchema);