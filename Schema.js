const Joi=require("joi");

module.exports.donorSchema=Joi.object({
    donor:Joi.object({
        fullName:Joi.string().required(),
        age:Joi.string().required().min(16),
        email:Joi.string().required(),
        mobile:Joi.number().required(),
        bloodGroup:Joi.string().required(),
        lastDonated:Joi.date().allow("",null),
        location:Joi.string().required(),
        country:Joi.string().required()
    }).required()
});

module.exports.organizationSchema=Joi.object({
    organization:Joi.object({
        organizatioName:Joi.string().required(),
        typeOfOrganization:Joi.string().required().allow("hospital","blood-bank"),
        email:Joi.string().required(),
        mobile:Joi.number().required(),
        location:Joi.string().required(),
        country:Joi.string().required(),
        owner:Joi.string().required(),
        
    }).required()
});

module.exports.emergencyBloodSchema=Joi.object({
    emergency:Joi.object({
        bloodGroup:Joi.string().required(),
        country:Joi.string().required(),
        location:Joi.string().required(),
        date:Joi.date()
    }).required()
});