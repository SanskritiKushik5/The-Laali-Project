const mongoose = require("mongoose");

const blogsSchema = new mongoose.Schema({
  mail: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  title: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("blogs", blogsSchema);
