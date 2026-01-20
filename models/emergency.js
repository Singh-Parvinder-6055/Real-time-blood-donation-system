const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const User=require("./user");


const emergencyRequirementSchema = new Schema({
  bloodGroup: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    required: true
  },

  unitsRequired: {
    type: Number,
    required: true,
    min: 1
  },

  urgencyLevel: {
    type: String,
    enum: ["low", "medium", "high"],
    required: true
  },

  requestedBy: {
    type: Schema.Types.ObjectId,
    ref: "User", // organization
    required: true
  },
  patient:{
    type:Schema.Types.ObjectId,
    ref:"User",
    required:true
  },

  city: {
    type: String,
    required: true
  },
  pincode:{
    type:String,
    required:true
  },

  status: {
    type: String,
    enum: ["open", "fulfilled", "closed"],
    default: "open"
  },
  fulfilledBy:{
    type:Schema.Types.ObjectId,
    ref:"User"
  },
  emergencyReason: String,
  fulfilledOn:Date,

//   requiredBy: {
//     type: Date,
//     required: true
//   },

  
},
{ timestamps: true } //this automatically two fields (i.e. createdAt and updatedAt)
);

module.exports = mongoose.model("Emergency",emergencyRequirementSchema);
