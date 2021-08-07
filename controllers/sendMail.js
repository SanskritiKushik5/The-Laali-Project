const nodemailer = require('nodemailer');
const dotenv = require("dotenv");
dotenv.config();

var transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "testyashu23@gmail.com",
        pass: process.env.GMAILPASSWORD,
    }
})

module.exports.sendResetEmail = async(email, token) => {
    var url = "http://localhost:8080/user/reset-password?token=" + token;
    console.log(url)
}

module.exports.sendVerifyEmail = async(email, token) => {
    var url = "http://localhost:8080/user/verifyEmail?token=" + token;
    console.log(url)
    await transport.sendMail({
        from: "testyashu23@gmail.com",
        to: email,
        subject: "VERIFY YOUR ACCOUNT",
        text: `Click this link to verify: ${url}`,
        html: `<h3>
        Click this link to verify: ${url}
        </h3>`
    }) 
}