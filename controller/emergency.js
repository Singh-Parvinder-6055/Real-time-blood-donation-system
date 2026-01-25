const Emergency = require("../models/emergency.js");
const User = require("../models/user.js");
const { emergencySchema } = require("../Schema.js");
const ExpressError = require("../utils/ExpressError.js");
const bloodCompatibility = require("../utils/bloodCompatibility.js");
const Notification = require("../models/notification");

module.exports.renderCreateEmergencyForm = (req, res) => {
    req.session.redirectUrl = "/";
    res.render("emergency/createEmergency.ejs");
};

module.exports.createEmergency = async (req, res) => {
    req.session.redirectUrl = "/emergency";

    let currUser = await User.findById(req.user._id);
    if (!currUser) {
        req.flash("error", "User not found");
        return res.redirect("/");
    }

    let emergency = req.body.emergency;
    let patientUsername = emergency.patient;
    let patientExists = await User.findOne({ username: patientUsername });

    if (patientExists == null || patientExists.role !== "patient") {
        req.flash("error", "Patient does not exist");
        return res.redirect("/emergency");
    }

    if (patientExists.patientBloodGroup !== emergency.bloodGroup) {
        req.flash("error", "Patient blood group does not match the provided blood group");
        return res.redirect("/emergency");
    }

    // Set automatic fields
    emergency.requestedBy = currUser._id.toString();
    emergency.patient = patientExists._id.toString();
    emergency.city = currUser.city;
    emergency.pincode = currUser.pincode;

    // Joi Validation
    let { error } = emergencySchema.validate(emergency);
    if (error) {
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }

    // Save Emergency
    let newEmergency = new Emergency(emergency);
    patientExists.emergencies.push({ emergency: newEmergency });
    currUser.emergencies.push({ emergency: newEmergency });

    await newEmergency.save();
    await patientExists.save();
    await currUser.save();

    // --- NOTIFICATION LOGIC START ---
    try {
        // 1. Find all compatible donor groups for this patient
        // If patient is A+, compatible donors are O-, O+, A-, A+
        const compatibleDonorGroups = Object.keys(bloodCompatibility).filter(donorType => 
            bloodCompatibility[donorType].includes(newEmergency.bloodGroup)
        );

        // 2. Find donors in the same pincode with compatible blood groups
        const matchingDonors = await User.find({
            pincode: newEmergency.pincode,
            role: "donor",
            bloodGroup: { $in: compatibleDonorGroups },
            _id: { $ne: currUser._id } // Don't notify the person who created it
        });

        // 3. Create Notification objects
        if (matchingDonors.length > 0) {
            const notifications = matchingDonors.map(donor => ({
                recipient: donor._id,
                message: `URGENT: ${newEmergency.bloodGroup} needed for a patient in your area (${newEmergency.city}).`,
                emergencyId: newEmergency._id
            }));

            await Notification.insertMany(notifications);
        }
    } catch (err) {
        console.error("Notification sending failed:", err);
        // We don't block the response if notifications fail
    }
    // --- NOTIFICATION LOGIC END ---

    req.flash("success", "Emergency Blood requirement Created Successfully!");
    res.redirect("/");
};

module.exports.destroyEmergency = async (req, res) => {
    let { id } = req.params;
    let emergency = await Emergency.findById(id);
    if (!emergency) {
        req.flash("error", "No emergency request found");
        return res.redirect(`/dashboard?role=${req.user.role}`);
    }
    if (emergency.isFulfilled) {
        req.flash("error", "This emergency request is fulfilled, and cannot be deleted.");
        return res.redirect(`/dashboard?role=${req.user.role}`);
    }

    await User.updateMany({ "emergencies.emergency": id }, { $pull: { emergencies: { emergency: id } } });
    
    // Also delete associated notifications
    await Notification.deleteMany({ emergencyId: id });

    await Emergency.findByIdAndDelete(id);
    req.flash("success", "Emergency request deleted successfully");
    res.redirect(`/dashboard?role=${req.user.role}`);
};

module.exports.fulfillEmergency = async (req, res) => {
    let { id } = req.params;
    let emergency = await Emergency.findById(id);
    let user = await User.findById(req.user._id);

    if(req.user.role=="admin"||req.user.role=="organizatio"){
                req.flash("error",`${req.user.role}s cannot fulfille emergency requirements`);
                return res.redirect("/activeEmergencies");
        }
    const patientGroup = emergency.bloodGroup;
    const donorGroup = user.bloodGroup;

    const isMatch = bloodCompatibility[donorGroup].includes(patientGroup);

    if (!isMatch) {
        req.flash("error", `Your blood group (${donorGroup}) is not compatible with the patient blood group (${patientGroup}).`);
        return res.redirect(`/activeEmergencies`);
    }

    const alreadySignedUp = await User.findOne({ _id: req.user._id, "emergencies.emergency": id });

    if (alreadySignedUp) {
        req.flash("error", "You have already signed up for this emergency.");
        return res.redirect("/activeEmergencies");
    }

    if (!emergency) {
        req.flash("error", "Emergency not found");
        return res.redirect("/activeEmergencies");
    }
    if (emergency.status === "fulfilled") {
        req.flash("error", "Required Units already collected");
        return res.redirect("/activeEmergencies");
    }

    emergency.unitsCollected++;
    if (emergency.unitsRequired == emergency.unitsCollected) {
        emergency.status = "fulfilled";
    }
    emergency.fulfilledBy.push({ donor: user });
    user.emergencies.push({ emergency: emergency });
    
    await emergency.save();
    await user.save();

    req.flash("success", "Successfully Registered for emergency donation");
    res.redirect("/");
};

module.exports.cancelFulfillEmergency = async (req, res) => {
    let { id } = req.params;
    let emergency = await Emergency.findById(id).populate("fulfilledBy.donor");

    if (!emergency) {
        req.flash("error", "Emergency not found");
        return res.redirect("/activeEmergencies");
    }

    let user = emergency.fulfilledBy.find(d => d.donor._id.equals(req.user._id));
    if (!user) {
        req.flash("error", "You are not assigned to this emergency");
        return res.redirect(`/dashboard?role=${req.user.role}`);
    }

    if (user.isCollected) {
        req.flash("error", "You have already donated blood, therefore, cannot cancel it");
        return res.redirect(`/dashboard?role=${req.user.role}`);
    }

    const newStatus = (emergency.unitsCollected - 1 < emergency.unitsRequired) ? "open" : "fulfilled";

    await Emergency.findByIdAndUpdate(id, {
        $inc: { unitsCollected: -1 },
        $set: { status: newStatus },
        $pull: { fulfilledBy: { donor: req.user._id } }
    });

    await User.findByIdAndUpdate(req.user._id, { $pull: { emergencies: { emergency: emergency._id } } });

    req.flash("success", "Fulfill request cancelled successfully");
    res.redirect(`/dashboard?role=${req.user.role}`);
};

module.exports.emergencyFulfilled = async (req, res) => {
    let { uId, eId } = req.params;

    const userResult = await User.updateOne(
        { _id: uId, "emergencies.emergency": eId },
        { $set: { "emergencies.$.donated": true } }
    );

    if (userResult.matchedCount === 0) {
        req.flash("error", "Invalid User ID or Emergency Link");
        return res.redirect(`/dashboard?role=${req.user.role}`);
    }

    await Emergency.updateOne(
        { _id: eId, "fulfilledBy.donor": uId },
        { $set: { "fulfilledBy.$.isCollected": true, "isFulfilled": true } }
    );
    req.flash("success", "Emergency fulfilled");
    res.redirect(`/dashboard?role=${req.user.role}`);
};

module.exports.denyFulfillEmergencyRequest = async (req, res) => {
    let { eId, dId } = req.params;
    let emergency = await Emergency.findById(eId).populate("fulfilledBy.donor");
    let emergencyDonor = await User.findById(dId);

    if (!emergency) {
        req.flash("error", "Emergency not found");
        return res.redirect(`/dashboard?role=${req.user.role}`);
    }

    let user = emergency.fulfilledBy.find(d => d.donor._id.equals(emergencyDonor._id));
    if (!user) {
        req.flash("error", "This donor has not fulfilled this requirement");
        return res.redirect(`/dashboard?role=${req.user.role}`);
    }

    if (user.isCollected) {
        req.flash("error", "This blood has already been collected, therefore, cannot deny the fulfill request.");
        return res.redirect(`/dashboard?role=${req.user.role}`);
    }

    const newStatus = (emergency.unitsCollected - 1 < emergency.unitsRequired) ? "open" : "fulfilled";

    await Emergency.findByIdAndUpdate(eId, {
        $inc: { unitsCollected: -1 },
        $set: { status: newStatus },
        $pull: { fulfilledBy: { donor: emergencyDonor._id } }
    });

    await User.findByIdAndUpdate(emergencyDonor._id, { $pull: { emergencies: { emergency: emergency._id } } });

    req.flash("success", "Donor's response has been denied successfully.");
    res.redirect(`/dashboard?role=${req.user.role}`);
};