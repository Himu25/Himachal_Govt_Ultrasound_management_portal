const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const ROSchema = new mongoose.Schema({
    name:{
    type: String,
    },
    adhaarNo: String,
    registrationNo : String,
    number:Number,
    email:String,
    roid:String,
    isActive: Boolean,
    count: Number,
    })
    ROSchema.pre('save', async function (next) {
        const doc = this;
        if (doc.isNew) {
        const count = await mongoose.model('RecommendingOfficer').countDocuments();
        doc.count = count + 1;
        var num = count + 1;
        var string = "" + num;
        var pad = "00000";
        n = pad.substring(0, pad.length - string.length) + string;
        doc.roid = ("ROID" + n.toString());
        }
        next();
    });
    const RecommendingOfficer = new mongoose.model("RecommendingOfficer",ROSchema);
    module.exports = RecommendingOfficer;