const mongoose = require('mongoose')
const express = require('express');
const router = express.Router()
const passport = require('passport');
require('../middleware/passport-local-strategy')
const Admin = require('../models/admin');
const bodyParser = require('body-parser');
const verifyCookieToken = require('../middleware/Verify-cookie-token');
router.use(bodyParser.urlencoded({ extended: false }))
const adminController = require('../controllers/adminController')

passport.checkAuthentication = function(req, res, next){

    if (req.isAuthenticated() && req.user.type === "Admin"){
        return next();
    }
    return res.redirect('/admin_login');
    }
router.get('/admin_login',adminController.adminLogin_get);

router.post('/admin/login', passport.authenticate('Admin',{failureRedirect: '/admin_login'},),adminController.createSession);

router.get('/admin_logout',adminController.destroySession);

router.get('/hcid',passport.checkAuthentication,adminController.healthCentreRegis_get);

router.get('/hcid/profileUpdate',passport.checkAuthentication,adminController.healthCentreProfileUpdate_get);

router.post('/hcid/profileUpdate',passport.checkAuthentication,adminController.healthCentreProfileUpdate_post);

router.get('/hcid/profileUpdate/next',passport.checkAuthentication,verifyCookieToken('HCIDprofileUpdtToken'),adminController.healthCentreProfileUpdateNext_get)

router.post('/hcid/profileUpdate/next',passport.checkAuthentication,verifyCookieToken('HCIDprofileUpdtToken'),adminController.healthCentreProfileUpdateNext_post)

router.post('/hcid',passport.checkAuthentication,adminController.healthCentreRegis_post);

router.get('/hcid/Deactivation',passport.checkAuthentication,adminController.healthCentreDeactivation_get)

router.post('/hcid/Deactivation',passport.checkAuthentication,adminController.healthCentreDeactivation_post)

router.get('/hcid/Reactivation',passport.checkAuthentication,adminController.healthCentreReactivation_get)

router.post('/hcid/Reactivation',passport.checkAuthentication,adminController.healthCentreReactivation_post)

router.get('/ucid',passport.checkAuthentication,adminController.ultrasoundCentreRegis_get)

router.post('/ucid',passport.checkAuthentication,adminController.ultrasoundCentreRegis_post);

router.get('/ucid/Reactivation',passport.checkAuthentication,adminController.ultrasoundCentreReactivation_get)

router.post('/ucid/Reactivation',passport.checkAuthentication,adminController.ultrasoundCentreReactivation_post)

router.get('/ucid/Deactivation',passport.checkAuthentication,adminController.ultrasoundCentreDeactivation_get)

router.post('/ucid/Deactivation',passport.checkAuthentication,adminController.ultrasoundCentreDeactivation_post)

router.get('/ucid/profileUpdate',passport.checkAuthentication,adminController.ultrasoundCentreProfileUpdate_get);

router.post('/ucid/profileUpdate',passport.checkAuthentication,adminController.ultrasoundCentreProfileUpdate_post);

router.get('/ucid/profileUpdate/next',passport.checkAuthentication,verifyCookieToken('UCIDprofileUpdtToken'),adminController.ultrasoundCentreProfileUpdateNext_get)

router.post('/ucid/profileUpdate/next',passport.checkAuthentication,verifyCookieToken('UCIDprofileUpdtToken'),adminController.ultrasoundCentreProfileUpdateNext_post)

router.get('/roid',passport.checkAuthentication,adminController.RoRegis_get)

router.post('/roid',passport.checkAuthentication,adminController.RoRegis_post);

router.get('/Ro/Reactivation',passport.checkAuthentication,adminController.RoReactivation_get)

router.post('/Ro/Reactivation',passport.checkAuthentication,adminController.RoReactivation_post)

router.get('/Ro/Deactivation',passport.checkAuthentication,adminController.RoDeactivation_get)

router.post('/Ro/Deactivation',passport.checkAuthentication,adminController.RoDeactivation_post)

router.get('/Ro/profileUpdate',passport.checkAuthentication,adminController.RoProfileUpdate_get);

router.post('/Ro/profileUpdate',passport.checkAuthentication,adminController.RoProfileUpdate_post);

router.get('/Ro/profileUpdate/next',passport.checkAuthentication,verifyCookieToken('ROIDprofileUpdtToken'),adminController.RoProfileUpdateNext_get)

router.post('/Ro/profileUpdate/next',passport.checkAuthentication,verifyCookieToken('ROIDprofileUpdtToken'),adminController.RoProfileUpdateNext_post)

router.get('/PUC/Report_input',passport.checkAuthentication,adminController.PUC_ReportInput_get);

router.post('/PUC/Report_input',passport.checkAuthentication,adminController.PUC_ReportInput_post);

router.get('/PUC/Report_output',passport.checkAuthentication,verifyCookieToken('PUC_ReportToken'),adminController.PUC_ReportOutput_get);

router.get('/GHC/Report_input',passport.checkAuthentication,adminController.GHC_ReportInput_get);

router.post('/GHC/Report_input',passport.checkAuthentication,adminController.GHC_ReportInput_post);

router.get('/GHC/Report_output',passport.checkAuthentication,verifyCookieToken('GHC_ReportToken'),adminController.GHC_ReportOutput_get);

router.get('/Token/Report_input',passport.checkAuthentication,adminController.Token_ReportInput_get);

router.post('/Token/Report_input',passport.checkAuthentication,adminController.Token_ReportInput_post);

router.get('/Token/Report_output',passport.checkAuthentication,verifyCookieToken('Token_ReportToken'),adminController.Token_ReportOutput_get);

router.get('/Token/StatusCheck_input',passport.checkAuthentication,adminController.Token_StatusCheckInput_get);

router.post('/Token/StatusCheck_input',passport.checkAuthentication,adminController.Token_StatusCheckInput_post);

router.get('/Token/StatusCheck_output',passport.checkAuthentication,verifyCookieToken('Token_StatusCheckToken'),adminController.Token_StatusCheckOutput_get);

router.get('/Beneficiary/StatusCheck_input',passport.checkAuthentication,adminController.Beneficiary_StatusCheckInput_get);

router.post('/Beneficiary/StatusCheck_input',passport.checkAuthentication,adminController.Beneficiary_StatusCheckInput_post);

router.get('/Beneficiary/StatusCheck_output',passport.checkAuthentication,verifyCookieToken('Beneficiary_StatusCheckToken'),adminController.Beneficiary_StatusCheckOutput_get);

router.get('/Beneficiary/Report_input',passport.checkAuthentication,adminController.Beneficiary_ReportInput_get)

router.post('/Beneficiary/Report_input',passport.checkAuthentication,adminController.Beneficiary_ReportInput_post);

router.get('/Beneficiary/Report_output',passport.checkAuthentication,verifyCookieToken('Beneficiary_ReportToken'),adminController.Beneficiary_ReportOutput_get);

router.get('/admin_logout',passport.checkAuthentication,adminController.destroySession)

module.exports = router
