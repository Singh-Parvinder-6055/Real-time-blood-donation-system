const express=require("express");
const router=express.Router({mergeParams:true});
const {isLoggedIn,isVerified,isNotAdmin,isNotOrganization,isNotPatient}=require("../middlewares");
const {}=require("../middlewares");
const campController=require("../controller/camp.js");
const wrapAsync=require("../utils/wrapAsync");
const Camp=require("../models/camp.js");
const User=require("../models/user.js");


router.route("/")
        .get(isLoggedIn,isVerified,campController.renderCreateCampForm)
        .post(isLoggedIn,isVerified,wrapAsync(campController.createCamp));
        
router.route("/edit/:id")
        .get(isLoggedIn,isVerified,wrapAsync(campController.renderEditCampForm))
        .patch(isLoggedIn,isVerified,wrapAsync(campController.editCamp));


router.delete("/:id",isLoggedIn,isVerified,wrapAsync(campController.deleteCamp));

router.patch("/participate/:id",isLoggedIn,isNotAdmin,isNotOrganization,isNotPatient,wrapAsync(campController.participateInCamp));

router.patch("/cancelParticipation/:id",isLoggedIn,wrapAsync(campController.cancelParticipation));


router.patch("/collected/:uId/:cId",isLoggedIn, isVerified,wrapAsync(campController.collecBloodInCamp));


//to deny Registration of a donor for a camp 
router.patch("/denyRegistration/:cId/:uId",isLoggedIn,isVerified,wrapAsync(campController.denyDonorRegistrationForCamp));

module.exports=router;

