const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const ucidSchema = new mongoose.Schema({
    type: String,
    name: String,
    state: String,
    district: String,
    block: String,
    location:String,
    number:Number,
    email:String,
    ucid:String,
    password:String,
    registrationCode: String,
    bankDetails: String,
    isActive: Boolean,
    count: Number,
    })
ucidSchema.pre("save", async function (next) {
        if (this.isModified("password")) {
            this.password = await bcrypt.hash(this.password,10);
        }
        next();
    })
    ucidSchema.pre('save', async function (next) {
        const doc = this;
        if (doc.isNew) {
        const count = await mongoose.model('Ucidregistration').countDocuments();
        doc.count = count + 1;
        var num = count + 1;
        var string = "" + num;
        var pad = "00000";
        n = pad.substring(0, pad.length - string.length) + string;
        doc.ucid = ("UCID" + n.toString());
        }
        next();
      });
    const Ucidregistration = new mongoose.model("Ucidregistration",ucidSchema);
    module.exports = Ucidregistration;