const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const resetToken = require('../models/resetTokens');
const user = require('../models/user');
const mailer = require('./sendMail');
const bcryptjs = require('bcryptjs');

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        next();
    } else {
        req.flash('error_messages', "Please Login to continue !");
        res.redirect('/login');
    }
}

router.get('/user/send-verification-email', checkAuth, async (req, res) => {
    if (req.user.isVerified || req.user.provider == 'google') {
        res.redirect('/profile');
    } else {
        var token = crypto.randomBytes(32).toString('hex');
        await resetToken({ token: token, email: req.user.email }).save();
        mailer.sendVerifyEmail(req.user.email, token);
        res.render('profile', { username: req.user.username, verified: req.user.isVerified, emailsent: true });
    }
});
router.get('/user/verifyemail', async (req, res) => {
    const token = req.query.token;
    if (token) {
        var check = await resetToken.findOne({ token: token });
        if (check) {
            var userData = await user.findOne({ email: check.email });
            userData.isVerified = true;
            await userData.save();
            await resetToken.findOneAndDelete({ token: token });
            res.redirect('/profile');
        } else {
            res.render('profile', { username: req.user.username, verified: req.user.isVerified, err: "Invalid token or Token has expired, Try again." });
        }
    } else {
        res.redirect('/profile');
    }
});
router.get('/user/forgot-password', async (req, res) => {
    res.render('forgot-password.ejs');

});
router.post('/user/forgot-password', async (req, res) => {
    const { email } = req.body;
    // not checking if the field is empty or not 
    // check if a user existss with this email
    var userData = await user.findOne({ email: email });
    console.log(userData);
    if (userData) {
        if (userData.provider == 'google') {
            res.render('forgot-password.ejs', { msg: "User exists with Google account. Try resetting your google account password or logging using it.", type: 'danger' });
        } else {
            var token = crypto.randomBytes(32).toString('hex');
            await resetToken({ token: token, email: email }).save();
            mailer.sendResetEmail(email, token);
            res.render('forgot-password.ejs', { msg: "Reset email sent. Check your email for more info.", type: 'success' });
        }
    } else {
        res.render('forgot-password.ejs', { msg: "No user Exists with this email.", type: 'danger' });

    }
});
router.get('/user/reset-password', async (req, res) => {
    const token = req.query.token;
    if (token) {
        var check = await resetToken.findOne({ token: token });
        if (check) {
            res.render('forgot-password.ejs', { reset: true, email: check.email });
        } else {
            res.render('forgot-password.ejs', { msg: "Token Tampered or Expired.", type: 'danger' });
        }
    } else {
        res.redirect('/login');
    }

});


router.post('/user/reset-password', async (req, res) => {
    const { password, password2, email } = req.body;
    if (!password || !password2 || (password2 != password)) {
        res.render('forgot-password.ejs', { reset: true, err: "Passwords Don't Match !", email: email });
    } else {
        var salt = await bcryptjs.genSalt(12);
        if (salt) {
            var hash = await bcryptjs.hash(password, salt);
            await user.findOneAndUpdate({ email: email }, { $set: { password: hash } });
            res.redirect('/login');
        } else {
            res.render('forgot-password.ejs', { reset: true, err: "Unexpected Error Try Again", email: email });

        }
    }
});
module.exports = router;