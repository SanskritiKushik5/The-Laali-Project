const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  event_title: {
    type: String,
    required: true,
  },
  event_description: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model("event", eventSchema);
