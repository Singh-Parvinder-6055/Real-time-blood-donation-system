 const mongoose=require("mongoose");
 const Schema=mongoose.Schema;
 const User=require("./user");

 const campSchema = new Schema(
  {
    title:{
        type:String,
        required:true
    },
    country:{
        type:String,
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

    startDateTime: {
      type: Date,
      required: true
    },

    endDateTime: {
      type: Date,
      required: true
    },

    organizer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed"],
      default: "upcoming"
    },

    registeredDonors: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  { timestamps: true }
);



 module.exports=mongoose.model("Camp",campSchema);