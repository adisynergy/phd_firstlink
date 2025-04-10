const Counter = require("../models/Counter_mongo");

async function getNextUserId() {
  const counter = await Counter.findByIdAndUpdate(
    { _id: "userid_counter" },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true } 
  );

  const paddedNumber = String(counter.sequence_value).padStart(6, "0");

  return `NITN/Phd/${paddedNumber}`;
}

module.exports = { getNextUserId };
