const bcrypt = require('bcrypt');
const Ucidregistration = require('../models/ucid');
const Hcidregistration = require('../models/hcid');
const RecommendingOfficer = require('../models/ro')
const Admin = require('../models/admin')
const jwt = require("jsonwebtoken")
const sendEmail = require('../models/mail')
const passport = require('passport')
const c = require('../models/constants');
const NewBeneficiary = require('../models/newBeneficiary');
const Token = require('../models/token')
exports.adminLogin_get = (req, res) => {
    if (req.isAuthenticated() && req.user.type === "Admin") {
        res.redirect('/hcid')
        return
    }
    res.render('admin', {
        heading: 'Admin Login',
        form_method_action: '<form action="/admin/login" method="post">',
        input1: `<input type="text" class="input" id="username" name="username" required autocomplete="off">
        <label for="username">Username</label>`
    });
}

exports.healthCentreRegis_get = (req, res) => {
    const success = req.query.success === 'true';
    var message = "GHC Registered Successfully!"
    res.render('admin/GHC/registration', { success, message });
}
exports.healthCentreRegis_post = async (req, res) => {
    try {
        const hcidregistration = new Hcidregistration({
            type: "Health_centre",
            name: req.body.name,
            state: "Himachal Pradesh",
            district: req.body.district,
            block: req.body.block,
            location: req.body.location,
            number: req.body.number,
            email: req.body.email,
            password: process.env.DEFAULTPASSWORD,
            isActive: true,
        })
        const registered = await hcidregistration.save();
        res.redirect('/hcid?success=true')
    } catch (error) {
        res.status(400).send(error);
    }
}
exports.healthCentreDeactivation_get = (req, res) => {
    const success = req.query.success === 'true';
    var message = "HCID Deactivated Successfully!"
    res.render('admin/GHC/deactivation', { success, message });
}
exports.healthCentreDeactivation_post = async (req, res) => {
    try {
        const Hcid = await Hcidregistration.findOne({ hcid: req.body.hcid })
        if (!Hcid) {
            var message = "HCID Not Found!"
            res.render('admin/GHC/deactivation', { alert: true, message })
            return
        }
        if (!(Hcid.isActive)) {
            var message = "HCID Already Deactivated!"
            res.render('admin/GHC/deactivation', { warning: true, message })
            return
        }
        await Hcid.updateOne({ $set: { isActive: false } });
        res.redirect('/hcid/Deactivation?success=true')
    } catch (error) {
        res.status(400).send(error);
    }
}

exports.healthCentreReactivation_get = (req, res) => {
    const success = req.query.success === 'true';
    var message = "HCID Activated Successfully!"
    res.render('admin/GHC/reactivation', { success, message });
}
exports.healthCentreReactivation_post = async (req, res) => {
    try {
        const Hcid = await Hcidregistration.findOne({ hcid: req.body.hcid })
        if (!Hcid) {
            var message = "HCID NOT Found!"
            res.render('admin/GHC/reactivation', { alert: true, message })
            return
        }
        if (Hcid.isActive) {
            var message = 'HCID Already Activated!'
            res.render('admin/GHC/reactivation', { warning: true, message })
            return
        }
        await Hcid.updateOne({ $set: { isActive: true } });
        res.redirect('/hcid/Reactivation?success=true')
    } catch (error) {
        res.status(400).send(error);
    }
}

exports.healthCentreProfileUpdate_get = (req, res) => {
    const success = req.query.success === 'true';
    var message = "GHC Profile Updated Successfully!"
    res.render('admin/GHC/profileUpdt', { success, message });
}
exports.healthCentreProfileUpdate_post = async (req, res) => {
    try {
        const Hcid = await Hcidregistration.findOne({ hcid: req.body.hcid });
        if (!Hcid) {
            var message = "HCID Not found!"
            res.render("admin/GHC/profileUpdt", { alert: true, message });
            return
        }
        const { name, district, block, location, number, email, _id } = Hcid;
        const oldFormData = { name, district, block, location, number, email };
        const payload = { oldFormData, _id }
        const token = jwt.sign(payload, process.env.JWT_SECRET);
        res.cookie('HCIDprofileUpdtToken', token, {
            httpOnly: true,
            secure: true,
            maxAge: 300000
        });
        res.redirect('/hcid/profileUpdate/next')
    } catch (error) {
        res.status(400).send(error);
    }
}

exports.healthCentreProfileUpdateNext_get = (req, res) => {
    res.render('admin/GHC/profileUpdtNext', { formData: req.decodedToken.oldFormData })
}
exports.healthCentreProfileUpdateNext_post = async (req, res) => {
    const _id = req.decodedToken._id
    const newFormData = req.body
    await Hcidregistration.findByIdAndUpdate(_id, newFormData)
    res.clearCookie('HCIDprofileUpdtToken');
    res.redirect('/hcid/profileUpdate?success=true')
}

exports.ultrasoundCentreProfileUpdate_get = (req, res) => {
    const success = req.query.success === 'true';
    var message = "Profile Updated Successfully!"
    res.render('admin/PUC/profileUpdt', { success, message });
}
exports.ultrasoundCentreProfileUpdate_post = async (req, res) => {
    try {
        const Ucid = await Ucidregistration.findOne({ ucid: req.body.ucid });
        if (!Ucid) {
            var message = "UCID NOT Found"
            res.render("admin/PUC/profileUpdt", { alert: true, message });
            return
        }
        const payload = { _id: Ucid._id }
        const token = jwt.sign(payload, process.env.JWT_SECRET)
        res.cookie('UCIDprofileUpdtToken', token, { httpOnly: true, secure: true, maxAge: 300000 });
        res.redirect('/ucid/profileUpdate/next')
    } catch (error) {
        res.status(400).send(error);
    }
}

exports.ultrasoundCentreProfileUpdateNext_get = async (req, res) => {
    try {
        let Ucid = await Ucidregistration.findOne({ _id: req.decodedToken._id })
        res.render("admin/PUC/profileUpdtNext", { formData: Ucid })
    } catch (error) {
        res.status(400).send(error)
    }
}
exports.ultrasoundCentreProfileUpdateNext_post = async (req, res) => {
    try {
        const _id = req.decodedToken._id
        const newFormData = req.body
        await Ucidregistration.findByIdAndUpdate(_id, newFormData)
        res.clearCookie('UCIDprofileUpdtToken');
        res.redirect('/ucid/profileUpdate?success=true')
    } catch (error) {
        res.status(400).send(error)
    }
}

exports.ultrasoundCentreDeactivation_get = (req, res) => {
    const success = req.query.success === 'true';
    var message = "UCID Deactivated Successfully!"
    res.render('admin/PUC/deactivation', { success, message })
}
exports.ultrasoundCentreDeactivation_post = async (req, res) => {
    try {
        const Ucid = await Ucidregistration.findOne({ ucid: req.body.ucid })
        if (!Ucid) {
            var message = 'UCID Not Found!'
            res.render('admin/PUC/deactivation', { alert: true, message })
            return
        }
        if (!(Ucid.isActive)) {
            var message = 'UCID Already Deactivated!'
            res.render('admin/PUC/deactivation', { warning: true, message })
            return
        }
        await Ucid.updateOne({ $set: { isActive: false } });
        res.redirect('/ucid/Deactivation?success=true')
    } catch (error) {
        res.status(400).send(error);
    }
}

exports.ultrasoundCentreReactivation_get = (req, res) => {
    const success = req.query.success === 'true';
    var message = "UCID Activated Successfully!"
    res.render('admin/PUC/reactivation', { success, message })
}
exports.ultrasoundCentreReactivation_post = async (req, res) => {
    try {
        const Ucid = await Ucidregistration.findOne({ ucid: req.body.ucid })
        if (!Ucid) {
            var message = 'UCID Not Found!'
            res.render('admin/PUC/reactivation', { alert: true, message })
            return
        }
        if (Ucid.isActive) {
            var message = 'UCID Already Activated!'
            res.render('admin/PUC/reactivation', { warning: true, message })
            return
        }
        await Ucid.updateOne({ $set: { isActive: true } });
        res.redirect('/ucid/Reactivation?success=true')
    } catch (error) {
        res.status(400).send(error);
    }
}
exports.ultrasoundCentreRegis_get = (req, res) => {
    const success = req.query.success === 'true';
    var message = "PUC Registered Successfully!"
    res.render('admin/PUC/registration', { success, message })
}

exports.ultrasoundCentreRegis_post = async (req, res) => {
    try {
        const ucidregistration = new Ucidregistration({
            type: "Ultrasound_centre",
            name: req.body.name,
            state: "Himachal Pradesh",
            district: req.body.district,
            block: req.body.block,
            location: req.body.location,
            registrationCode: req.body.registrationCode,
            number: req.body.number,
            email: req.body.email,
            password: process.env.DEFAULTPASSWORD,
            bankDetails: req.body.bankDetails,
            isActive: true,
        })
        const registered = await ucidregistration.save();
        res.redirect('/ucid?success=true')
    } catch (error) {
        res.status(400).send(error);
    }
}
exports.RoRegis_get = (req, res) => {
    const success = req.query.success === 'true';
    var message = "RO Registered Successfully!"
    res.render('admin/RO/registration', { success, message })
}

exports.RoRegis_post = async (req, res) => {
    try {
        const formData = req.body
        const registrationNo = await RecommendingOfficer.findOne({ registrationNo: req.body.registrationNo });
        if (registrationNo) {
            res.render("admin/RO/registration", { formData, alert: true, message: 'RO Already Registered! Try again with different Registration Number' })
            return
        }
        const recommendingOfficer = new RecommendingOfficer({
            name: req.body.name,
            registrationNo: req.body.registrationNo,
            number: req.body.number,
            email: req.body.email,
            adhaarNo: req.body.adhaarNo,
            isActive: true,
        })
        const registered = await recommendingOfficer.save();
        res.redirect('/roid?success=true')
    } catch (error) {
        res.status(400).send(error);
    }
}

exports.RoDeactivation_get = (req, res) => {
    const success = req.query.success === 'true';
    var message = "RO Deactivated Successfully!"
    res.render('admin/RO/deactivation', { success, message })
}
exports.RoDeactivation_post = async (req, res) => {
    try {
        const Roid = await RecommendingOfficer.findOne({ roid: req.body.roid })
        if (!Roid) {
            res.render('admin/RO/deactivation', { alert: true, message: 'ROID Not Found' })
            return
        }
        if (!(Roid.isActive)) {
            res.render('admin/RO/deactivation', { warning: true, message: 'RO Already Deactivated!' })
            return
        }
        await Roid.updateOne({ $set: { isActive: false } });
        res.redirect('/Ro/Deactivation?success=true')
    } catch (error) {
        res.status(400).send(error);
    }
}

exports.RoReactivation_get = (req, res) => {
    const success = req.query.success === 'true';
    var message = "RO Reactivated Successfully!"
    res.render('admin/RO/reactivation', { success, message })
}
exports.RoReactivation_post = async (req, res) => {
    try {
        const Roid = await RecommendingOfficer.findOne({ roid: req.body.roid })
        if (!Roid) {
            res.render('admin/RO/reactivation', { alert: true, message: 'ROID Not Found' })
            return
        }
        if (Roid.isActive) {
            res.render('admin/RO/reactivation', { warning: true, message: 'RO Already Activated!' })
            return
        }
        await Roid.updateOne({ $set: { isActive: true } });
        res.redirect('/Ro/Reactivation?success=true')
    } catch (error) {
        res.status(400).send(error);
    }
}

exports.RoProfileUpdate_get = (req, res) => {
    const success = req.query.success === 'true';
    var message = "RO Profile Updated Successfully!"
    res.render('admin/RO/profileUpdt', { success, message })
}
exports.RoProfileUpdate_post = async (req, res) => {
    try {
        const Roid = await RecommendingOfficer.findOne({ roid: req.body.roid });
        if (!Roid) {
            res.render('admin/RO/profileUpdt', { alert: true, message: 'ROID Not Found' })
            return
        }
        const { name, registrationNo, adhaarNo, number, email, _id } = Roid;
        const oldFormData = { name, registrationNo, adhaarNo, number, email };
        console.log(oldFormData);
        const payload = { oldFormData, _id }
        const token = jwt.sign(payload, process.env.JWT_SECRET);
        res.cookie('ROIDprofileUpdtToken', token, {
            httpOnly: true,
            secure: true,
            maxAge: 300000
        });
        res.redirect(`/Ro/profileUpdate/next`)
    } catch (error) {
        res.status(400).send(error);
    }
}
exports.RoProfileUpdateNext_get = (req, res) => {
    res.render("admin/RO/profileUpdtNext", { formData: req.decodedToken.oldFormData });
}
exports.RoProfileUpdateNext_post = async (req, res) => {
    const formData = req.body
    let ro = await RecommendingOfficer.findOne({ _id: req.decodedToken._id });
    let RO = await RecommendingOfficer.findOne({ registrationNo: req.body.registrationNo })
    if (RO && RO.registrationNo !== ro.registrationNo) {
        res.render("admin/RO/profileUpdtNext", { formData, alert: true, message: 'Registration Number Already Registered' });
        return
    }
    await ro.updateOne({
        $set: {
            name: req.body.name, registrationNo: req.body.registrationNo,
            number: req.body.number, adhaarNo: req.body.adhaarNo, email: req.body.email,
        }
    });
    res.redirect('/Ro/profileUpdate?success=true')
}
exports.createSession = (req, res) => {
    return res.redirect('/hcid')
}

// Reports 

exports.PUC_ReportInput_get = (req, res) => {
    res.render('admin/Report/puc_input')
}

exports.PUC_ReportInput_post = async (req, res) => {
    const data = req.body
    const payload = { data }
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    res.cookie('PUC_ReportToken', token, {
        httpOnly: true,
        secure: true,
        maxAge: 1800000
    });
    res.redirect('/PUC/Report_output')
}

exports.PUC_ReportOutput_get = async (req, res) => {
    let tokens;
    try {
        const data = req.decodedToken.data
        const dateCondition = {};
        if (data.from && data.to) {
            dateCondition.ToTS = {
                $gte: data.from,
                $lte: data.to
            };
        }

        if (data.type === c.SINGLE) {
            tokens = await Token.find({
                'completedBy.ucid': data.ucid,
                'status': c.COMPLETED_STATUS,
                ...dateCondition
            });
        } else if (data.type === c.BLOCK) {
            tokens = await Token.find({
                'completedBy.block': data.block,
                'completedBy.district': data.district,
                'status': c.COMPLETED_STATUS,
                ...dateCondition
            });
        } else if (data.type === c.DISTRICT) {
            tokens = await Token.find({
                'completedBy.district': data.district,
                'status': c.COMPLETED_STATUS,
                ...dateCondition
            });
        }
        const groupedPUCs = {};
        for (const token of tokens) {
            const ucid = token.completedBy.ucid;
            if (groupedPUCs[ucid]) {
                groupedPUCs[ucid].count += 1;
            } else {
                const puc = await Ucidregistration.findOne({ ucid });
                if (puc) {
                    groupedPUCs[ucid] = {
                        ucid,
                        name: puc.name,
                        count: 1,
                    };
                } else {
                    groupedPUCs[ucid] = {
                        ucid,
                        name: 'Unknown',
                        count: 1,
                    };
                }
            }
        }
        const results = Object.values(groupedPUCs);
        const payload = {
            DToRG: new Date(),
            UserID: req.user.username,
            from: data.from,
            to: data.to,
            TotalTC: tokens.length,
        }
        res.render('admin/Report/puc_output', { tokens, results, payload });
    } catch (err) {
        console.error('Failed to fetch data from MongoDB:', err);
        res.status(500).send('Internal Server Error');
    }
};


exports.GHC_ReportInput_get = (req, res) => {
    res.render('admin/Report/ghc_input')
}

exports.GHC_ReportInput_post = async (req, res) => {
    const data = req.body
    const payload = { data }
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    res.cookie('GHC_ReportToken', token, {
        httpOnly: true,
        secure: true,
        maxAge: 1800000
    });
    res.redirect('/GHC/Report_output')
}

exports.GHC_ReportOutput_get = async (req, res) => {
    let BIDs;
    try {
        const data = req.decodedToken.data;
        const dateCondition = {};
        if (data.from && data.to) {
            dateCondition.ToBR = {
                $gte: data.from,
                $lte: data.to
            };
        }

        if (data.type === c.SINGLE) {
            BIDs = await NewBeneficiary.find({
                'registeredBy.hcid': data.hcid,
                ...dateCondition
            });
        } else if (data.type === c.BLOCK) {
            BIDs = await NewBeneficiary.find({
                'registeredBy.block': data.block,
                'registeredBy.district': data.district,
                ...dateCondition
            });
        } else if (data.type === c.DISTRICT) {
            BIDs = await NewBeneficiary.find({
                'registeredBy.district': data.district,
                ...dateCondition
            });
        }
        const groupedGHCs = {};
        for (const BID of BIDs) {
            const hcid = BID.registeredBy.hcid;
            if (groupedGHCs[hcid]) {
                groupedGHCs[hcid].count += 1;
            } else {
                const ghc = await Hcidregistration.findOne({ hcid });
                if (ghc) {
                    groupedGHCs[hcid] = {
                        hcid,
                        name: ghc.name,
                        count: 1,
                    };
                } else {
                    groupedGHCs[hcid] = {
                        hcid,
                        name: 'Unknown',
                        count: 1,
                    };
                }
            }
        }
        const results = Object.values(groupedGHCs);
        const payload = {
            DToRG: new Date(),
            UserID: req.user.username,
            from: data.from,
            to: data.to,
            TotalCount: BIDs.length,
        }
        res.render('admin/Report/ghc_output', { results, payload });
    } catch (err) {
        console.error('Failed to fetch data from MongoDB:', err);
        res.status(500).send('Internal Server Error');
    }
};
// beneficiary Report
exports.Beneficiary_ReportInput_get = (req, res) => {
    res.render('admin/Report/beneficiary_input')
}

exports.Beneficiary_ReportInput_post = async (req, res) => {
    const data = req.body
    const payload = { data }
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    res.cookie('Beneficiary_ReportToken', token, {
        httpOnly: true,
        secure: true,
        maxAge: 1800000
    });
    res.redirect('/Beneficiary/Report_output')
}

exports.Beneficiary_ReportOutput_get = async (req, res) => {
    try {
        let projection = {
            'registeredBy.hcid': 1,
            bid: 1,
            ToBR: 1,
            completed: 1,
        };
        let query = {};
        const data = req.decodedToken.data;
        const dateCondition = {};
        if (data.from && data.to) {
            dateCondition.ToBR = {
                $gte: data.from,
                $lte: data.to
            };
        }

        if (data.type === c.SINGLE) {
            query = {
                'registeredBy.hcid': data.hcid,
                ...dateCondition
            };
        } else if (data.type === c.BLOCK) {
            query = {
                'registeredBy.block': data.block,
                'registeredBy.district': data.district,
                ...dateCondition
            };
        } else if (data.type === c.DISTRICT) {
            query = {
                'registeredBy.district': data.district,
                ...dateCondition
            };
        }
        let BIDs = await NewBeneficiary.find(query, projection);
        const counts = {
            total: BIDs.length,
            completed_0: 0,
            completed_1: 0,
            completed_2: 0,
            completed_3: 0
        };

        for (const BID of BIDs) {
            switch (BID.completed) {
                case 0:
                    counts.completed_0 += 1;
                    break;
                case 1:
                    counts.completed_1 += 1;
                    break;
                case 2:
                    counts.completed_2 += 1;
                    break;
                case 3:
                    counts.completed_3 += 1;
                    break;
                default:
                    break;
            }
        }
        const payload = {
            DToRG: new Date(),
            UserID: req.user.username,
            from: data.from,
            to: data.to,
        }
        res.render('admin/Report/beneficiary_output', { results: BIDs, payload,counts });
    } catch (err) {
        console.error('Failed to fetch data from MongoDB:', err);
        res.status(500).send('Internal Server Error');
    }
};
exports.Token_ReportInput_get = (req, res) => {
    res.render('admin/Report/token_input')
}
exports.Token_ReportInput_post = async (req, res) => {
    const data = req.body
    const payload = { data }
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    res.cookie('Token_ReportToken', token, {
        httpOnly: true,
        secure: true,
        maxAge: 1800000
    });
    res.redirect('/Token/Report_output')
}

exports.Token_ReportOutput_get = async (req, res) => {
    let tokens;
    try {
        const data = req.decodedToken.data;
        const dateCondition = {};
        if (data.from && data.to) {
            dateCondition.ToTC = {
                $gte: data.from,
                $lte: data.to
            };
        }
        if (data.type === c.SINGLE) {
            tokens = await Token.find({
                'assignedBy.hcid': data.hcid,
                ...dateCondition
            });
        } else if (data.type === c.BLOCK) {
            tokens = await Token.find({
                'assignedBy.block': data.block,
                'assignedBy.district': data.district,
                ...dateCondition
            });
        } else if (data.type === c.DISTRICT) {
            tokens = await Token.find({
                'assignedBy.district': data.district,
                ...dateCondition
            });
        }
        const statusCounts = {
            all: tokens.length,
            new: 0,
            completed: 0,
            inService: 0,
            expired: 0
        };

        for (const token of tokens) {
            switch (token.status) {
                case c.NEW_STATUS:
                    statusCounts.new += 1;
                    break;
                case c.COMPLETED_STATUS:
                    statusCounts.completed += 1;
                    break;
                case c.INSERVICE_STATUS:
                    statusCounts.inService += 1;
                    break;
                case c.EXPIRED_STATUS:
                    statusCounts.expired += 1;
                    break;
                default:
                    break;
            }
        }
        const payload = {
            DToRG: new Date(),
            UserID: req.user.username,
            from: data.from,
            to: data.to,
        }
        res.render('admin/Report/token_output', { tokens, payload, statusCounts });
    } catch (err) {
        console.error('Failed to fetch data from MongoDB:', err);
        res.status(500).send('Internal Server Error');
    }
};
exports.Token_StatusCheckInput_get = (req, res) => {
    res.render('admin/Status_check/tokenStatusInput')
}
exports.Token_StatusCheckInput_post = async (req, res) => {
    const beneficiaryToken = await Token.findOne({ TokenID: req.body.TokenID })
    if (!beneficiaryToken) {
        res.render('admin/Status_check/tokenStatusInput', { alert: true, message: 'TID Not Exist' })
        return
    }
    const payload = { TokenID: req.body.TokenID }
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    res.cookie('Token_StatusCheckToken', token, {
        httpOnly: true,
        secure: true,
        maxAge: 1800000
    });
    res.redirect('/Token/StatusCheck_output')
}

exports.Token_StatusCheckOutput_get = async (req, res) => {
    const TokenID = req.decodedToken.TokenID
    try {
        const beneficiaryToken = await Token.findOne({ TokenID })
        if (!beneficiaryToken){
            res.status(500).send('Something went wrong');
            return
        }
        const payload = {
            DToRG: new Date(),
            UserID: req.user.username,
        }
        res.render('admin/Status_check/tokenStatusOutput', { Token: beneficiaryToken, payload })
    } catch (err) {
        console.error('Failed to fetch data from MongoDB:', err);
        res.status(500).send('Internal Server Error');
    }
};

exports.Beneficiary_StatusCheckInput_get = (req, res) => {
    res.render('admin/Status_check/beneficiaryInput')
}
exports.Beneficiary_StatusCheckInput_post = async (req, res) => {
    const beneficiary = await NewBeneficiary.findOne({ bid: req.body.bid })
    if (!beneficiary) {
        res.render('admin/Status_check/beneficiaryInput', { alert: true, message: 'BID Not Exist' })
        return
    }
    const payload = { bid: req.body.bid }
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    res.cookie('Beneficiary_StatusCheckToken', token, {
        httpOnly: true,
        secure: true,
        maxAge: 1800000
    });
    res.redirect('/Beneficiary/StatusCheck_output')
}

exports.Beneficiary_StatusCheckOutput_get = async (req, res) => {
    try {
        const bid = req.decodedToken.bid
        const beneficiary = await NewBeneficiary.findOne({ bid })
        if (!beneficiary){
            res.status(500).send('Something went wrong');
            return
        }
        const Tokens = await Token.find({ bid })
        let completedTokenCount = 0;
        for (const Token of Tokens) {
            if (Token.status === c.COMPLETED_STATUS) {
                completedTokenCount++;
            }
        }
        const payload = {
            DToRG: new Date(),
            UserID: req.user.username,
            completedTokenCount
        }
        res.render('admin/Status_check/beneficiaryOutput', { beneficiary, Tokens, payload})
    } catch (err) {
        console.error('Failed to fetch data from MongoDB:', err);
        res.status(500).send('Internal Server Error');
    }
};

exports.destroySession = function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/admin_login');
    });
    return
}
