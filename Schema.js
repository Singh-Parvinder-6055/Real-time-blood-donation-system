const Joi=require("joi");

module.exports.userSchema = Joi.object({
  username: Joi.string().email().required(),
  password: Joi.string().min(6).required(),

  role: Joi.string()
    .valid("donor", "organization")
    .required(),

  name: Joi.string().min(2).required(),

  phone: Joi.number().required(),
  
  email:Joi.string().required(),

  // Donor-only
  bloodGroup: Joi.when("role", {
    is: "donor",
    then: Joi.string()
      .valid("A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-")
      .required(),
    otherwise: Joi.forbidden()
  }),
  age:Joi.when("role",{
    is:"donor",
    then:Joi.number().min(16).required(),
    otherwise: Joi.forbidden()
  }),

  lastDonationDate: Joi.when("role", {
    is: "donor",
    then: Joi.date().optional(),
    otherwise: Joi.forbidden()
  }),

  // Organization-only
  organizationType: Joi.when("role", {
    is: "organization",
    then: Joi.string()
      .valid("hospital", "blood-bank")
      .required(),
    otherwise: Joi.forbidden()
  }),

  country:Joi.string().required(),
  location:Joi.string().required()
});




module.exports.emergencyBloodSchema=Joi.object({
    emergency:Joi.object({
        bloodGroup:Joi.string().required(),
        country:Joi.string().required(),
        location:Joi.string().required(),
        date:Joi.date(),
        nameOfOrganization:Joi.string(),
    }).required()
});

