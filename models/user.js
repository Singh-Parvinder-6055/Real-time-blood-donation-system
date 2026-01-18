const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose").default;
const Schema= mongoose.Schema;

const userSchema = new Schema({
  role: {
    type: String,
    enum: ["donor", "patient", "organization","admin"],
    required: true
  },

  name: {
    type: String,
    
  },

  phone:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true
  },

  // ---------- Donor ----------
  bloodGroup: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
  },

  lastDonationDate: Date,

  isAvailable: {
    type: Boolean,
    default: true
  },

  // ---------- Patient ----------
  patientBloodGroup: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
  },
  
  //---for donor and patient----
  age: Number,

  //---for patient only----
  medicalNotes: String,

  // ---------- Organization ----------
  organizationType: {
    type: String,
    enum: ["hospital", "blood-bank", "ngo"]
  },
  emergencies:[
    {
        type:Schema.Types.ObjectId,
        ref:"Emergency"
    }
  ],
  camps:[{
    type:Schema.Types.ObjectId,
    ref:"DonationCamp"
  }],

//----common data-----
  country:{
    type:String,
    required:true
  },
  city:{
    type:String,
    required:true,
  },

//----for admin and organization----
  isVerified: {
    type: Boolean,
    default: false
  }
}); 

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
