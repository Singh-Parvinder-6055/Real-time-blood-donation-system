const Joi = require("joi");

//Joi schema for user
module.exports.userSchema = Joi.object({
  // Common fields
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(4).required(),
  email: Joi.string().email().required(),
  
  role: Joi.string()
    .valid("donor", "patient", "organization")
    .required(),

  name: Joi.string().min(2).max(100).required(),

  phone: Joi.string()
        .max(12)
        .required(),

  country: Joi.string().required(),
  city: Joi.string().required(),

  // ───────── DONOR ONLY ─────────
  bloodGroup: Joi.when("role", {
    is: "donor",
    then: Joi.string()
      .valid("A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-")
      .required(),
    otherwise: Joi.forbidden()
  }),

  age: Joi.when("role", {
  switch: [
    {
      is: "donor",
      then: Joi.number().min(18).required()
    },
    {
      is: "patient",
      then: Joi.number().required()
    }
  ],
  otherwise: Joi.forbidden()
}),

  lastDonationDate: Joi.when("role", {
    is: "donor",
    then: Joi.date().optional(),
    otherwise: Joi.forbidden()
  }),

  // ───────── PATIENT ONLY ─────────
  patientBloodGroup: Joi.when("role", {
    is: "patient",
    then: Joi.string()
      .valid("A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-")
      .required(),
    otherwise: Joi.forbidden()
  }),

  // ───────── ORGANIZATION ONLY ─────────
  organizationType: Joi.when("role", {
    is: "organization",
    then: Joi.string()
      .valid("hospital", "blood-bank", "ngo")
      .required(),
    otherwise: Joi.forbidden()
  }),

  
});



//Joi schema for emergency blood requirements
module.exports.emergencySchema = Joi.object({
  bloodGroup: Joi.string()
    .valid("A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-")
    .required(),

  unitsRequired: Joi.number().min(1).required(),

  urgencyLevel: Joi.string()
    .valid("low", "medium", "high")
    .required(),

  requestedBy: Joi.string().required(),

  city: Joi.string().required(),

  status: Joi.string()
    .valid("open", "fulfilled", "closed")
    .default("open"),

  fulfilledBy: Joi.when("status", {
    is: "fulfilled",
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  }),

  fulfilledOn: Joi.when("status", {
    is: "fulfilled",
    then: Joi.date().required(),
    otherwise: Joi.forbidden()
  }),
  //createdAt:Joi.date().required()
});




module.exports.campSchema = Joi.object({
  country: Joi.string()
    .min(2)
    .required(),

  city: Joi.string()
    .min(2)
    .required(),

  startDateTime: Joi.date() 
    .greater("now")   //should be greater than now
    .required(),

  endDateTime: Joi.date()
    .greater(Joi.ref("startDateTime")) //end time should be greater than start time
    .required(),

  organizer: Joi.string()
    .required(),

  status: Joi.string()
    .valid("upcoming", "ongoing", "completed", "cancelled")
    .optional(),

  registeredDonors: Joi.array()
    .items(Joi.string())
    .optional()
});


module.exports.verificationSchema = Joi.object({
  organization: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid organization ID"
    }),

  document: Joi.object({
    documentType: Joi.string()
      .valid(
        "registration_certificate",
        "hospital_license",
        "government_id",
        "other"
      )
      .required(),

    documentUrl: Joi.string()
      .required()
  }).required(),

  verificationStatus: Joi.string()
    .valid("pending", "approved", "rejected")
    .default("pending"),

  verifiedBy: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),

  verifiedAt: Joi.date().optional(),

  rejectionReason: Joi.when("verificationStatus", {
    is: "rejected",
    then: Joi.string().min(5).required(),
    otherwise: Joi.forbidden()
  })
});
