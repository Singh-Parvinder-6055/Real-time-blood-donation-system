const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const User=require("./user");

const verificationSchema = new Schema(
  {
    // role:{
    //     type:String,
    //     enum:["organization"],
    //     required:true
    // },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    document:{
        documentType: {
          type: String,
          enum: [
            "registration_certificate",
            "hospital_license",
            "government_id",
            "other"
          ],
          required: true
        },
        documentUrl: {
          type: String,
          required: true
        }
      },

    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User" // admin
    },

    verifiedAt: {
      type: Date
    },

    rejectionReason: {
      type: String,
      default:null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Verification",verificationSchema);
