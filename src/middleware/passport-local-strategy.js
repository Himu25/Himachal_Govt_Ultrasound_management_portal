const passport = require('passport');

const LocalStrategy = require('passport-local').Strategy;

const Hcidregistration = require('../models/hcid');
const Ucidregistration = require('../models/ucid');
const Admin = require('../models/admin');

const bcrypt = require('bcrypt');

passport.use('healthCentre',new LocalStrategy({
    usernameField: 'hcid'
},
    async (hcid, password, done) => {
        try {
            const user = await Hcidregistration.findOne({ hcid: hcid });
            if (!user) {
                return done(null, false);
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false);
            }
            return done(null, user);
        } catch (err) {
            console.log(err);
        }
    }));

passport.use('UltrasoundCentre', new LocalStrategy({
    usernameField: 'ucid'
},
    async (ucid, password, done) => {
        try {
            const user = await Ucidregistration.findOne({ ucid: ucid });
            if (!user) {
                return done(null, false);
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false);
            }
            return done(null, user);
        } catch (err) {
            console.log(err);
        }
    }));
    passport.use('Admin', new LocalStrategy({
        usernameField: 'username'
    },
    async (username, password, done) => {
        try {
            const user = await Admin.findOne({ username: username });
            if (!user) {
                return done(null, false);
            }
            if (user.password !== password) {
                return done(null, false);
            }
            return done(null, user);
        } catch (err) {
            console.log(err);
        }
        }));
passport.serializeUser(function (user, done) {
    done(null, { id: user.id, type: user.type });
});
passport.deserializeUser(async function (login, done) {
    try {
        if (login.type === 'Admin') {
            const admin = await Admin.findById(login.id)
            if (admin) {
                return done(null, admin)
            }else{
                done(null, false)
            }
            return
        }
        if (login.type === 'Health_centre') {
            const Hcid = await Hcidregistration.findById(login.id)
            if (Hcid) {
                return done(null, Hcid)
            }else{
                done(null, false)
            }
            return
        }
        if (login.type === 'Ultrasound_centre') {
            const Ucid = await Ucidregistration.findById(login.id)
            if (Ucid) {
                return done(null, Ucid)
            }else{
                done(null, false)
            }
        }
    } catch (err) {
        console.log(err);
    }
});
passport.setAuthenticatedUser = function (req, res, next) {
    if (req.isAuthenticated()){
        res.locals.user = req.user;
    }
    next();
}
module.exports = passport;