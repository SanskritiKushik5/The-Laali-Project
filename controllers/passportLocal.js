const user = require('../models/user');
const bcryptjs = require('bcryptjs');
const localStrategy = require('passport-local');

module.exports = function(passport) {
    passport.use(new localStrategy({ usernameField: 'email' }, (email, password, done) => {
        user.findOne({ email: email }, (err, data) => {
            console.log("Entered");
            console.log(err, data);
            if (err) throw err;
            if(!data){
                return done(null, false, {message: "User Doesn't Exist!"});
            }
            bcryptjs.compare(password, data.password, (err, match) => {
                if(err){
                    return done(null, false);
                }
                if(!match){
                    return done(null, false, {message: "Password Doesn't match!"})
                }
                if(match){
                    return done(null, data);
                }
            })
        })
    }));
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
        user.findById(id, (err, user) => {
            done(err, user);
        })
    })
}