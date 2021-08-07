const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  designation: {
    type: String,
  },
  password: {
    type: String,
  },
  isSuscribed: {
    type: Boolean,
    default: false,
  },
  ageGroup: {
    type: String,
  },
  qualification: {
    type: String,
  },
  mentorEmail: {
    type: String,
  },
  menteeEmail: {
    type: String,
  },
  mentor: {
    type: Boolean,
    default: false,
  },
  mentee: {
    type: Boolean,
    default: false,
  },
  isMeeting: {
    type: Boolean,
  },
  zoomURL: {
    type: String,
  },
  meetingDate: {
    type: Date,
  },
  //   qualification: {
  //       type: String,
  //   }
});

module.exports = mongoose.model("user", userSchema);
