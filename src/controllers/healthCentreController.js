const bcrypt = require('bcrypt');
const Hcidregistration = require('../models/hcid');
const NewBeneficiary = require('../models/newBeneficiary');
const sendEmail = require('../models/mail')
const axios = require('axios');
const jwt = require("jsonwebtoken")
const _ = require('lodash');
const c = require('../models/constants');
require('../models/config')
require('../middleware/passport-local-strategy')
const { sendSMS } = require('../models/sms');
const isCaseInsensitiveEqual = require('../models/objectComparison');
const RecommendingOfficer = require('../models/ro');
const Token = require('../models/token');
const Ucidregistration = require('../models/ucid');
// functions
function generateOTP() {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const message = `Your OTP for registration is ${otp}. Please do not share this with anyone.`;
    return { otp, message };
}

function formatDate(timestamp) {
    const date = new Date(timestamp);

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const formattedDate = `${day}/${month}/${year}`;

    return formattedDate;
}

function convertObjectToString(obj) {
    var convertedObj = {};

    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            convertedObj[key] = String(obj[key]);
        }
    }

    return convertedObj;
}

// controllers

exports.healthCentreLogin_get = (req, res) => {
    if (req.isAuthenticated() && req.user.type === "Health_centre") {
        res.redirect('/GHC/welcome')
        return
    }
    res.render('admin', {
        heading: 'Health Centre Login',
        form_method_action: '<form action="/healthCentre/login" method="post">',
        forgot: `<a href="/forgot_password_Hcid">Forgot HCID Password?</a>`,
        input1: `<input type="text" name="hcid" class="input" id="hcid" required autocomplete="off">
    <label for="hcid">HCID</label>`,
    })
}

exports.newBeneficiaryRegis_get = (req, res) => {
    const success = req.query.success === 'true';
    var message = "Registered Successfully!"
    res.render('health-centre/newBeneficiaryRegis', { success, message });
}

exports.newBeneficiaryRegis_post = async (req, res) => {
    try {
        const formData = req.body;
        const beneficiary = await NewBeneficiary.findOne({ AadharNo: req.body.AadharNo });
        if (beneficiary) {
            res.render('health-centre/newBeneficiaryRegis', {
                alert: true,
                message: "Aadhar number already registered",
                formData,
                invalidClass: 'invalid',
            });
            return;
        }
        const { otp, message } = generateOTP();
        console.log(otp);
        // const response = await sendSMS(message, '+916386845325');
        const hidenNumber = ("+91XXXXXXXX" + req.user.number.toString().slice(-4));
        const payload = { formData, otp, hidenNumber }
        const token = jwt.sign(payload, process.env.JWT_SECRET);
        res.cookie('BeneficiaryRegisToken', token, {
            httpOnly: true,
            secure: true, // Set 'secure' to true if using HTTPS
            maxAge: 300000 // 5 minutes in milliseconds
        });
        res.redirect('/health-centre/beneficiary/approval')
    } catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
};
exports.newBeneficiaryApproval_get = (req, res) => {
    res.render('health-centre/regisApprove', { number: req.decodedToken.hidenNumber });
}
exports.newBeneficiaryApproval_post = async (req, res) => {
    try {
        if (!req.isOTPValid) {
            const message = 'Invalid OTP, please try again!';
            res.render('health-centre/regisApprove', { alert: true, message, number });
            return;
        }
        const formData = req.decodedToken.formData
        formData.isActive = true;
        formData.ToBR = new Date();
        formData.registeredBy = {
            hcid: req.user.hcid,
            block: req.user.block,
            district: req.user.district
        };
        const newBeneficiary = new NewBeneficiary(formData);
        await newBeneficiary.save();
        res.clearCookie('BeneficiaryRegisToken');
        res.redirect('/health-centre/beneficiary/registration?success=true');
        return
    } catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
};

exports.beneficiaryProfileUpdate_get = (req, res) => {
    const success = req.query.success === 'true';
    var message = "Profile Updated Successfully!"
    res.render('health-centre/beneficiaryprofileUpdt', { success, message });
}

exports.beneficiaryProfileUpdate_post = async (req, res) => {
    try {
        const beneficiary = await NewBeneficiary.findOne({ bid: req.body.bid });
        if (!beneficiary) {
            const message = "BID not exist!"
            res.render('health-centre/beneficiaryProfileUpdt', { alert: true, message })
            return
        }
        const { name, dob, wifeOf, number, address, doctor, gravida, _id } = beneficiary;
        const oldFormData = { name, wifeOf, dob, number, gravida, address, doctor, _id };
        const payload = { oldFormData }
        const token = jwt.sign(payload, process.env.JWT_SECRET);
        res.cookie('profileUpdtToken', token, {
            httpOnly: true,
            secure: true, // Set 'secure' to true if using HTTPS
            maxAge: 300000 // 5 minutes in milliseconds
        });
        res.redirect('/health-centre/beneficiary/profileUpdateNext')
    } catch (error) {
        res.status(400).send(error);
    }
}

exports.beneficiaryProfileUpdateNext_get = (req, res) => {
    res.render('health-centre/beneficiaryprofileUpdtNext', { formData: req.decodedToken.oldFormData });
}
exports.beneficiaryProfileUpdateNext_post = async (req, res) => {
    try {
        const newFormData = req.body;
        const oldFormData = convertObjectToString(req.decodedToken.oldFormData)
        const excludedFields = ['_id'];
        const isSame = isCaseInsensitiveEqual(newFormData, oldFormData, excludedFields);
        if (isSame) {
            var message = "No changes were made.";
            res.render('health-centre/beneficiaryprofileUpdtNext', {
                warning: true,
                formData: newFormData,
                message
            });
        } else {
            const { otp, message } = generateOTP()
            console.log(otp);
            const hidenNumber = ("+91XXXXXXXX" + req.user.number.toString().slice(-4));
            const payload = { newFormData, otp, _id: oldFormData._id, hidenNumber }
            const token = jwt.sign(payload, process.env.JWT_SECRET);
            res.cookie('profileUpdtApprvToken', token, {
                httpOnly: true,
                secure: true,
                maxAge: 300000
            });
            // const response = await sendSMS(message, '+916386845325');
            res.redirect('/health-centre/beneficiary/profileUpdate/approval')
        }
    } catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
}

exports.beneficiaryProfileUpdateApprove_get = (req, res) => {
    res.render('health-centre/profileUpdtApprv', { number: req.decodedToken.hidenNumber })
}
exports.beneficiaryProfileUpdateApprove_post = async (req, res) => {
    try {
        if (!req.isOTPValid) {
            const message = 'Invalid OTP, please try again!';
            res.render('health-centre/profileUpdtApprv', { alert: true, message, number: req.decodedToken.hidenNumber });
            return;
        }
        const { newFormData, _id } = req.decodedToken
        await NewBeneficiary.findByIdAndUpdate(_id, newFormData)
        res.clearCookie('profileUpdtToken');
        res.clearCookie('profileUpdtApprvToken');
        res.redirect('/health-centre/beneficiary/profileUpdate?success=true')
        return;
    } catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
};

exports.beneficiaryReactivation_get = (req, res) => {
    const success = req.query.success === 'true';
    var message = "Reactivated Successfully!"
    res.render('health-centre/reactivation', { success, message });
}
exports.beneficiaryReactivation_post = async (req, res) => {
    try {
        const Bid = await NewBeneficiary.findOne({ bid: req.body.bid })
        if (!Bid) {
            res.render('health-centre/reactivation', {
                alert: true,
                message: "BID not exist"
            })
            return
        }
        if (Bid.isActive) {
            res.render('health-centre/reactivation', {
                warning: true,
                message: "Already Activated"
            })
            return
        }
        await Bid.updateOne({ $set: { isActive: true } });
        res.redirect('/health-centre/beneficiary/Reactivation?success=true')
    } catch (error) {
        res.status(400).send(error);
    }
}
exports.beneficiaryDeactivation_get = (req, res) => {
    const success = req.query.success === 'true';
    var message = "Deactivated Successfully!"
    res.render('health-centre/deactivation', { success, message });
}
exports.beneficiaryDeactivation_post = async (req, res) => {
    try {
        const Bid = await NewBeneficiary.findOne({ bid: req.body.bid })
        if (!Bid) {
            res.render('health-centre/deactivation', {
                alert: true,
                message: "BID not exist"
            })
            return
        }
        if (!(Bid.isActive)) {
            res.render('health-centre/deactivation', {
                warning: true,
                message: "Already Deactivated"
            })
            return
        }
        await Bid.updateOne({ $set: { isActive: false } });
        res.redirect('/health-centre/beneficiary/Deactivation?success=true')
    } catch (error) {
        res.status(400).send(error);
    }
}

exports.tokenGeneration_get = (req, res) => {
    const success = req.query.success === 'true';
    var message = "Token Generated Successfully!"
    res.render('Token/generation', { success, message});
}

exports.tokenGeneration_post = async (req, res) => {
    try {
        const formData = req.body
        if (!(req.user.isActive)) {
            const message = "HCID DEACTIVATED, Contact Administrator"
            res.render('Token/generation', { alert: true, message,formData})
            return
        }
        const Roid = await RecommendingOfficer.findOne({ roid: req.body.roid })
        if (!Roid || !Roid.isActive) {
            const message = "ROID don't exist or DEACTIVATED, Contact Administrator"
            res.render('Token/generation', { alert: true, message,formData})
            return
        }
        const bid = formData.bid
        const Bid = await NewBeneficiary.findOne({ bid: bid })
        if (!Bid || !Bid.isActive) {
            const message = "BID don't exist or DEACTIVATED, Contact Administrator"
            res.render('Token/generation', { alert: true, message,formData})
            return
        }
        const newToken = await Token.findOne({ status: c.NEW_STATUS, bid: bid })
        const inserviceToken = await Token.findOne({ status: c.INSERVICE_STATUS, bid: bid, })
        if (newToken || inserviceToken) {
            const message = "Please Use Existing Active Token"
            res.render('Token/generation', { warning: true, message,formData})
            return
        }
        const count = await Token.countDocuments({ bid: bid, status: c.COMPLETED_STATUS })
        if (count >= 3) {
            const message = "Free Limit Exhausted"
            res.render('Token/generation', { warning: true, message,formData})
            return
        }
        const { otp, message } = generateOTP();
        console.log(otp);
        // const response = await sendSMS(message, '+916386845325');
        const hidenNumber = ("+91XXXXXXXX" + Roid.number.toString().slice(-4));
        const AadharNo = Bid.AadharNo
        const payload = { hidenNumber, otp,AadharNo, formData}
        const token = jwt.sign(payload, process.env.JWT_SECRET);
        res.cookie('tokenApproval', token, { httpOnly: true, secure: true, maxAge: 300000 });
        res.redirect('/health-centre/beneficiary/Token-approval')
    } catch (error) {
        res.status(400).send(error);
    }
}
exports.tokenApproval_get = (req, res) => {
    res.render('Token/generation_approval', { number: req.decodedToken.number })
}
exports.tokenApproval_post = async (req, res) => {
    const { hidenNumber, AadharNo,formData } = req.decodedToken;
    if (!req.isOTPValid) {
        const message = 'Invalid OTP, please try again!';
        res.render('health-centre/generation_approval', { alert: true, message, number: hidenNumber });
        return;
    }
    let selectedUcids = [];
    const ucidsWithSameBlock = await Ucidregistration.find({ district: formData.district, block: formData.block,isActive: true})
        .limit(3)
        .select('ucid');
    const ucidsFromSameBlockCount = ucidsWithSameBlock.length;
    if (ucidsFromSameBlockCount < 3) {
        const remainingUcidsFromSameDistrict = await Ucidregistration.find({ district: formData.district, block: { $ne: formData.block },isActive: true })
            .limit(3 - ucidsFromSameBlockCount)
            .select('ucid');
        const remainingUcidsFromSameDistrictCount = remainingUcidsFromSameDistrict.length;
        if (ucidsFromSameBlockCount + remainingUcidsFromSameDistrictCount < 3) {
            const remainingUcidsFromAnywhere = await Ucidregistration.find({ district: { $ne: formData.district },isActive: true })
                .limit(3 - ucidsFromSameBlockCount - remainingUcidsFromSameDistrictCount)
                .select('ucid');
                selectedUcids  = [
                ...ucidsWithSameBlock.map(ucidObj => ucidObj.ucid),
                ...remainingUcidsFromSameDistrict.map(ucidObj => ucidObj.ucid),
                ...remainingUcidsFromAnywhere.map(ucidObj => ucidObj.ucid)
            ];
        } else {
            selectedUcids  = [
                ...ucidsWithSameBlock.map(ucidObj => ucidObj.ucid),
                ...remainingUcidsFromSameDistrict.map(ucidObj => ucidObj.ucid)
            ];
        }
    } else {
        selectedUcids  = ucidsWithSameBlock.map(ucidObj => ucidObj.ucid);
    }

    const token = new Token({
        ucids: selectedUcids,
        status: c.NEW_STATUS,
        bid: formData.bid,
        roid: formData.roid,
        assignedBy: {
            hcid: req.user.hcid,
            district: req.user.district,
            block: req.user.block,
        },
    })
    const registered = await token.save();
    // const Message = `Your Token Approved Successfully,
    // TokenID: ${registered.TokenID}
    // BID: ${bid}
    // AadharNo: ${AadharNo}
    // (DoTC): ${formatDate(registered.DoTC)}
    // (DoTE):  ${formatDate(registered.DoTE)}`;

    res.clearCookie('tokenApproval')
    // const response = await sendSMS(Message, '+916386845325');
    res.redirect('/health-centre/beneficiary/Token-generation?success=true')
}
exports.healthCentre_HomePage = (req,res)=>{
    res.render('welcome_GHC',{name: req.user.name})
}
exports.createSession = (req, res) => {
    return res.redirect('/GHC/welcome')
}
exports.destroySession = function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/healthCentre_login');
    });
    return
}
