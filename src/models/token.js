const mongoose = require('mongoose');
const UcidRegistration = require('../models/ucid')
const moment = require('moment-timezone');
const TokenSchema = new mongoose.Schema({
    TokenID: {
        type: String,
        unique: true,
    },
    bid: String,
    status: String,
    ToTC: Date,
    ToTE: Date,
    ToTS: Date,
    completedBy:{
        ucid: String,
        district: String,
        block: String,
    },
    roid: String,
    assignedBy:{
        hcid: String,
        district: String,
        block: String,
    },
    ucids: [String],
});

TokenSchema.pre('save', function (next) {
    this.ToTC = new Date();
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);
    this.ToTE = expirationDate;    
    next();
});
TokenSchema.pre('save', async function (next) {
    const doc = this;
    if (doc.isNew) {
        const count = await mongoose.model('Token').countDocuments();
        doc.count = count + 1;
        const num = count + 1;
        const string = "" + num;
        const pad = "0000";
        const n = pad.substring(0, pad.length - string.length) + string;
        const randomString = Math.floor(1000 + Math.random() * 9000).toString();
        doc.TokenID = ("TID" + n.toString() + randomString);
    }

    next();
});

const Token = mongoose.model('Token', TokenSchema);
module.exports = Token;
