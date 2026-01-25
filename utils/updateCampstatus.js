const Camp = require("../models/camp");

async function updateCampStatus() {
  const now = new Date();

  //  upcoming → active
  await Camp.updateMany(
    {
      startDateTime: { $lte: now },
      endDateTime: { $gte: now },
      status: "upcoming"
    },
    { status: "ongoing" }
  );

  //  active / upcoming → completed
  await Camp.updateMany(
    {
      endDateTime: { $lt: now },
      status: { $in: ["upcoming", "active"] }
    },
    { status: "completed" }
  );
}

module.exports = updateCampStatus;
