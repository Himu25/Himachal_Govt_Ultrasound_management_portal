const mongoose = require('mongoose')
const express = require('express');
const router = express.Router()
const passport = require('passport');
const verifyCookieToken = require('../middleware/Verify-cookie-token');
require('../middleware/passport-local-strategy')
const verifyOTP = require('../middleware/OTP-Verification')
const Limiter = require('../middleware/OTP-Limiter')
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }))
const healthCentreController = require('../controllers/healthCentreController');

passport.checkAuthentication = function (req, res, next) {
    if (req.isAuthenticated() && req.user.type === "Health_centre") {
        return next();
    }
    return res.redirect('/healthCentre_login');
}

/////////////////////////////////////////////////////////////////////////////////

router.get("/healthCentre_login", healthCentreController.healthCentreLogin_get)

router.post('/healthCentre/login', passport.authenticate('healthCentre', { failureRedirect: '/healthCentre_login' },),healthCentreController.createSession);

router.get('/GHC/welcome',passport.checkAuthentication,healthCentreController.healthCentre_HomePage)

router.get("/health-centre/beneficiary/registration", passport.checkAuthentication, healthCentreController.newBeneficiaryRegis_get);

router.post('/health-centre/beneficiary/registration', passport.checkAuthentication,Limiter, healthCentreController.newBeneficiaryRegis_post);

router.get("/health-centre/beneficiary/approval", passport.checkAuthentication, verifyCookieToken('BeneficiaryRegisToken'), healthCentreController.newBeneficiaryApproval_get);

router.post("/health-centre/beneficiary/approval", passport.checkAuthentication, verifyCookieToken('BeneficiaryRegisToken'), verifyOTP, healthCentreController.newBeneficiaryApproval_post);

router.get('/health-centre/beneficiary/profileUpdate', passport.checkAuthentication, healthCentreController.beneficiaryProfileUpdate_get);

router.post('/health-centre/beneficiary/profileUpdate', passport.checkAuthentication, healthCentreController.beneficiaryProfileUpdate_post)

router.get('/health-centre/beneficiary/profileUpdateNext', passport.checkAuthentication,verifyCookieToken('profileUpdtToken'), healthCentreController.beneficiaryProfileUpdateNext_get)

router.post('/health-centre/beneficiary/profileUpdateNext', passport.checkAuthentication,verifyCookieToken('profileUpdtToken'),Limiter, healthCentreController.beneficiaryProfileUpdateNext_post)

router.get('/health-centre/beneficiary/profileUpdate/approval', passport.checkAuthentication,verifyCookieToken('profileUpdtApprvToken'), healthCentreController.beneficiaryProfileUpdateApprove_get);

router.post('/health-centre/beneficiary/profileUpdate/approval', passport.checkAuthentication,verifyCookieToken('profileUpdtApprvToken'),verifyOTP, healthCentreController.beneficiaryProfileUpdateApprove_post);

router.get('/health-centre/beneficiary/Deactivation', passport.checkAuthentication, healthCentreController.beneficiaryDeactivation_get);

router.post('/health-centre/beneficiary/Deactivation', passport.checkAuthentication, healthCentreController.beneficiaryDeactivation_post);

router.get('/health-centre/beneficiary/Reactivation', passport.checkAuthentication, healthCentreController.beneficiaryReactivation_get);

router.post('/health-centre/beneficiary/Reactivation', passport.checkAuthentication, healthCentreController.beneficiaryReactivation_post);

router.get('/healthCentre_logout', passport.checkAuthentication, healthCentreController.destroySession);

router.get('/health-centre/beneficiary/Token-generation', passport.checkAuthentication, healthCentreController.tokenGeneration_get);

router.post('/health-centre/beneficiary/Token-generation', passport.checkAuthentication,Limiter, healthCentreController.tokenGeneration_post);

router.get('/health-centre/beneficiary/Token-approval', passport.checkAuthentication,verifyCookieToken('tokenApproval'), healthCentreController.tokenApproval_get);

router.post('/health-centre/beneficiary/Token-approval', passport.checkAuthentication,verifyCookieToken('tokenApproval'),verifyOTP,healthCentreController.tokenApproval_post);


module.exports = router