const mongoose = require("mongoose");

const alumniSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  workExp: {
    type: String,
    required: true,
  },
  linkedin: {
    type: String,
    required: true,
  },
  twitter: {
    type: String,
    required: true,
  },
  organization: {
    type: String,
    required: true,
  },
  skillset: {
    type: String,
    required: true,
  },
  awards_and_honours: {
    type: String,
    required: true,
  },
  isPending: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("alumni", alumniSchema);
