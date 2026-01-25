const express=require("express");
const router=express.Router({mergeParams:true});
const {isVerified,isLoggedIn,isNotAdmin,isNotOrganization,isNotPatient}=require("../middlewares");
const wrapAsync=require("../utils/wrapAsync");
const emergencyController=require("../controller/emergency.js");
const Emergency=require("../models/emergency.js");
const User=require("../models/user.js");

router.route("/")
        .get(isLoggedIn,isVerified,emergencyController.renderCreateEmergencyForm)
        .post(isLoggedIn,isVerified,wrapAsync(emergencyController.createEmergency));

router.delete("/:id",isLoggedIn,isVerified,wrapAsync(emergencyController.destroyEmergency));

router.patch("/fulfill/:id",isLoggedIn,isNotAdmin,isNotOrganization,isNotPatient,wrapAsync(emergencyController.fulfillEmergency));


router.patch("/cancelFulfill/:id",isLoggedIn,wrapAsync(emergencyController.cancelFulfillEmergency));

router.patch("/fulfilled/:uId/:eId",isLoggedIn, isVerified,wrapAsync(emergencyController.emergencyFulfilled));

//to deny fulfill Emergency request of donor
router.patch("/denyFulfillRequest/:eId/:dId",isLoggedIn, isVerified,wrapAsync(emergencyController.denyFulfillEmergencyRequest));


module.exports=router;