const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const hcidSchema = new mongoose.Schema({
    type: String,
    name: {
        type: String,
        lowercase: true
    },
    state: String,
    location: {
        type: String,
        lowercase: true
    },
    district: String,
    block:String,
    number: {
        type: Number,
    },
    email: String,
    hcid: {
        type:String,
        unique: true,
    },
    password: String,
    isActive: Boolean,
    count: Number,
})
hcidSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
})
hcidSchema.pre('save', async function (next) {
    const doc = this;
    const count = await mongoose.model('Hcidregistration').countDocuments();
    doc.count = count + 1;
    var num = count + 1;
    var string = "" + num;
    var pad = "00000";
    n = pad.substring(0, pad.length - string.length) + string;
    doc.hcid = ("HCID" + n.toString());
    next();
});
const Hcidregistration = new mongoose.model("Hcidregistration", hcidSchema);
module.exports = Hcidregistration;