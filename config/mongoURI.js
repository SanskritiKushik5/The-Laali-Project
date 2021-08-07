const dotenv = require("dotenv");

dotenv.config();

module.exports = `mongodb+srv://newuser:${process.env.PASSWORD}@node-auth.jdfks.mongodb.net/Team-67?retryWrites=true&w=majority`;
