const bcrypt = require('bcrypt');
const Ucidregistration = require('../models/ucid');
const sendEmail = require('../models/mail')
const passport = require('passport')
const c = require('../models/constants');
const jwt = require("jsonwebtoken")
const NewBeneficiary = require('../models/newBeneficiary');
const { sendSMS } = require('../models/sms');
const Token = require('../models/token')
require('../middleware/passport-local-strategy')

// functions
function generateOTP() {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const message = `Your OTP for registration is ${otp}. Please do not share this with anyone.`;
    return { otp, message };
}
const currentTime = new Date();
const options = {
    timeZone: 'Asia/Kolkata',
    hour12: false,
};
///////

exports.ultrasoundCentreLogin_get = (req, res) => {
    if (req.isAuthenticated() && req.user.type === "Ultrasound_centre") {
        res.redirect('/PUC/welcome')
        return
    }
    res.render('admin', {
        heading: 'Ultrasound Centre Login',
        form_method_action: '<form action="/ultrasoundCentre/login" method="post">',
        forgot: `<a href="/forgot_password_Ucid">Forgot UCID Password?</a>`,
        input1: `<input type="text" name = "ucid" class="input" id="ucid" required autocomplete="off">
        <label for="ucid">UCID</label>`
    });
}


exports.ultrasoundCentre_HomePage = (req,res)=>{
    res.render('welcome_PUC',{name: req.user.name})
}

exports.createSession = (req, res) => {
    return res.redirect('/PUC/welcome')
}

exports.tokenTransferRequest_get = (req, res) => {
    const success = req.query.success === 'true';
    var message = "Token Transferred Successfully!"
    res.render('Token/transfer', { success, message, });
}
exports.tokenTransferRequest_post = async (req, res) => {
    try {
        const Tid = await Token.findOne({ TokenID: req.body.TokenID })
        if (!Tid || Tid.status !== c.NEW_STATUS) {
            const mssge = !Tid ? 'TID Not Found!' : `Sorry! OTP cannot be Generated! TID Status = ${Tid.status}`;
            res.render('Token/transfer', { alert: true, message: mssge });
            return;
        }
        const beneficiary = await NewBeneficiary.findOne({ bid: Tid.bid })
        const { message, otp } = generateOTP()
        const hidenNumber = ("+91XXXXXXXX" + beneficiary.number.toString().slice(-4))
        const payload = { hidenNumber, otp, Tid_id: Tid._id }
        const token = jwt.sign(payload, process.env.JWT_SECRET);
        res.cookie('transferReqApproval', token, { httpOnly: true, secure: true, maxAge: 300000 });
        console.log(otp);
        // const response = await sendSMS(message, '+916386845325');
        res.redirect('/UC/beneficiary/Token-transfer-approval')
    } catch (error) {
        res.status(400).send(error);
    }
}

exports.tokenTransferRequestApproval_get = (req, res) => {
    res.render('Token/transfer_approval', { number: req.decodedToken.hidenNumber })
}
exports.tokenTransferRequestApproval_post = async (req, res) => {
    try {
        if (!req.isOTPValid) {
            const message = 'Invalid OTP, please try again!';
            res.render('Token/transfer_approval', { alert: true, message, number: req.decodedToken.hidenNumber });
            return;
        }
        const Tid_id = req.decodedToken.Tid_id
        await Token.findByIdAndUpdate(Tid_id, { $set: { status: c.INSERVICE_STATUS } })
        res.clearCookie('transferReqApproval');
        res.redirect('/UC/beneficiary/Token-transfer?success=true')
    } catch (error) {
        res.status(400).send(error);
    }
}

exports.tokenCompletion_get = (req, res) => {
    const success = req.query.success === 'true';
    var message = "Congrats! TID SERVICED Successfully"
    res.render('Token/completion', { success, message, });
}
exports.tokenCompletion_post = async (req, res) => {
    try {
        const Tid = await Token.findOne({ TokenID: req.body.TokenID })
        if (!Tid || Tid.status !== c.INSERVICE_STATUS || !Tid.ucids.includes(req.user.ucid)) {
            const mssge = !Tid
                ? "TID Not Found!"
                : Tid.status !== c.INSERVICE_STATUS
                    ? `Sorry! OTP cannot be generated. TID Status = ${Tid.status}`
                    : `Sorry! OTP cannot be generated. Please Go To assigned Ultrasound-Centre.`;
            res.render('Token/completion', { alert: true, message: mssge });
            return;
        }
        const beneficiary = await NewBeneficiary.findOne({ bid: Tid.bid })
        const { message, otp } = generateOTP()
        const hidenNumber = ("+91XXXXXXXX" + beneficiary.number.toString().slice(-4))
        const payload = { hidenNumber, otp, Tid_id: Tid._id, bid: Tid.bid }
        const token = jwt.sign(payload, process.env.JWT_SECRET);
        res.cookie('completionClaimApproval', token, { httpOnly: true, secure: true, maxAge: 300000 });
        console.log(otp);
        // const response = await sendSMS(message, '+916386845325');
        res.redirect('/UC/beneficiary/Token-completion-approval')
    } catch (error) {
        res.status(400).send(error);
    }
}

exports.tokenCompletionClaimApproval_get = (req, res) => {
    res.render('Token/completion_approval', { number: req.decodedToken.hidenNumber })
}
exports.tokenCompletionClaimApproval_post = async (req, res) => {
    try {
        if (!req.isOTPValid) {
            const message = 'Invalid OTP, please try again!';
            res.render('Token/completion_approval', { alert: true, message, number: req.decodedToken.hidenNumber });
            return;
        }
        const Tid_id = req.decodedToken.Tid_id
        await Token.findByIdAndUpdate(Tid_id, {
            $set: {
                status: c.COMPLETED_STATUS,
                ToTS: new Date(),
                completedBy: {
                    ucid: req.user.ucid,
                    district: req.user.district,
                    block: req.user.block,
                }
            }
        })
        const bid = req.decodedToken.bid
        await NewBeneficiary.findOneAndUpdate(
            { bid },
            { $inc: { completed: 1 } }
        );
        res.clearCookie('completionClaimApproval');
        res.redirect('/UC/beneficiary/Token-completion?success=true')
    } catch (error) {
        res.status(400).send(error);
    }
}

exports.tokenReleaseRequest_get = (req, res) => {
    const success = req.query.success === 'true';
    var message = "TID Released Successfully, Avoid this in Future, It may lead to deactivation of your account."
    res.render('Token/release', { success, message, });
}
exports.tokenReleaseRequest_post = async (req, res) => {
    try {
        const Tid = await Token.findOne({ TokenID: req.body.TokenID })
        if (!Tid || Tid.status !== c.INSERVICE_STATUS || !Tid.ucids.includes(req.user.ucid)) {
            const mssge = !Tid
                ? "TID Not Found!"
                : Tid.status !== c.INSERVICE_STATUS
                    ? `Sorry! OTP cannot be generated. TID Status = ${Tid.status}`
                    : `Sorry! OTP cannot be generated. Please Go To assigned Ultrasound-Centre.`;
            res.render('Token/release', { alert: true, message: mssge });
            return;
        }
        const beneficiary = await NewBeneficiary.findOne({ bid: Tid.bid })
        const { message, otp } = generateOTP()
        const hidenNumber = ("+91XXXXXXXX" + beneficiary.number.toString().slice(-4))
        const payload = { hidenNumber, otp, Tid_id: Tid._id }
        const token = jwt.sign(payload, process.env.JWT_SECRET);
        res.cookie('releaseRequestApproval', token, { httpOnly: true, secure: true, maxAge: 300000 });
        console.log(otp);
        // const response = await sendSMS(message, '+916386845325');
        res.redirect('/UC/beneficiary/Token-releaseRequest-approval')
    } catch (error) {
        res.status(400).send(error);
    }
}

exports.tokenReleaseRequestApproval_get = (req, res) => {
    res.render('Token/release_approval', { number: req.decodedToken.hidenNumber })
}
exports.tokenReleaseRequestApproval_post = async (req, res) => {
    try {
        if (!req.isOTPValid) {
            const message = 'Invalid OTP, please try again!';
            res.render('Token/release_approval', { alert: true, message, number: req.decodedToken.hidenNumber });
            return;
        }
        const Tid_id = req.decodedToken.Tid_id
        await Token.findByIdAndUpdate(Tid_id, { $set: { status: "released" } })
        res.clearCookie('releaseRequestApproval');
        res.redirect('/UC/beneficiary/Token-releaseRequest?success=true')
    } catch (error) {
        res.status(400).send(error);
    }
}

exports.destroySession = function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/ultrasoundCentre_login');
    });
}
