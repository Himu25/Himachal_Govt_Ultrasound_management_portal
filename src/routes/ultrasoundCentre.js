const mongoose = require('mongoose')
const express = require('express');
const router = express.Router()
const passport = require('passport');
const Ucidregistration = require('../models/ucid');
require('../middleware/passport-local-strategy')
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }))
const verifyCookieToken = require('../middleware/Verify-cookie-token');
const verifyOTP = require('../middleware/OTP-Verification')
const Limiter = require('../middleware/OTP-Limiter')
const ultrasoundCentreController = require('../controllers/ultrasoundCentreController');
passport.checkAuthentication = function(req, res, next){
    if (req.isAuthenticated() && req.user.type === "Ultrasound_centre"){
        return next();
    }
    return res.redirect('/ultrasoundCentre_login');
    }
////////////////////////////////////////////////////////////////////////////////////
router.get("/ultrasoundCentre_login",ultrasoundCentreController.ultrasoundCentreLogin_get)
router.post('/ultrasoundCentre/login', passport.authenticate('UltrasoundCentre',{failureRedirect: '/ultrasoundCentre_login'},),
ultrasoundCentreController.createSession);


router.get('/UC/logout',passport.checkAuthentication,ultrasoundCentreController.destroySession);
 
router.get('/PUC/welcome',passport.checkAuthentication,ultrasoundCentreController.ultrasoundCentre_HomePage)

router.get('/UC/beneficiary/Token-transfer', passport.checkAuthentication, ultrasoundCentreController.tokenTransferRequest_get);

router.post('/UC/beneficiary/Token-transfer', passport.checkAuthentication, Limiter, ultrasoundCentreController.tokenTransferRequest_post);

router.get('/UC/beneficiary/Token-transfer-approval', passport.checkAuthentication, verifyCookieToken('transferReqApproval'), ultrasoundCentreController.tokenTransferRequestApproval_get);

router.post('/UC/beneficiary/Token-transfer-approval', passport.checkAuthentication,verifyCookieToken('transferReqApproval'), verifyOTP, ultrasoundCentreController.tokenTransferRequestApproval_post);

router.get('/UC/beneficiary/Token-completion', passport.checkAuthentication, ultrasoundCentreController.tokenCompletion_get);

router.post('/UC/beneficiary/Token-completion', passport.checkAuthentication, Limiter, ultrasoundCentreController.tokenCompletion_post);

router.get('/UC/beneficiary/Token-completion-approval', passport.checkAuthentication, verifyCookieToken('completionClaimApproval'), ultrasoundCentreController.tokenCompletionClaimApproval_get);

router.post('/UC/beneficiary/Token-completion-approval', passport.checkAuthentication,verifyCookieToken('completionClaimApproval'), verifyOTP, ultrasoundCentreController.tokenCompletionClaimApproval_post);

router.get('/UC/beneficiary/Token-releaseRequest', passport.checkAuthentication, ultrasoundCentreController.tokenReleaseRequest_get);

router.post('/UC/beneficiary/Token-releaseRequest', passport.checkAuthentication, Limiter, ultrasoundCentreController.tokenReleaseRequest_post);

router.get('/UC/beneficiary/Token-releaseRequest-approval', passport.checkAuthentication, verifyCookieToken('releaseRequestApproval'), ultrasoundCentreController.tokenReleaseRequestApproval_get);

router.post('/UC/beneficiary/Token-releaseRequest-approval', passport.checkAuthentication,verifyCookieToken('releaseRequestApproval'), verifyOTP, ultrasoundCentreController.tokenReleaseRequestApproval_post);

module.exports = router