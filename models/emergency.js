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
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // organization
    required: true
  },

  city: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ["open", "fulfilled", "closed"],
    default: "open"
  },

  requiredBy: {
    type: Date,
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("EmergencyRequirement",emergencyRequirementSchema);
