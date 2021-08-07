const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
  },
});

module.exports = mongoose.model("email", emailSchema);
