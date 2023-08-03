const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const newBeneficiarySchema = new mongoose.Schema({
  name: String,
  wifeOf: String,
  dob: String,
  number: Number,
  AadharNo: {
      type: String,
      unique: true,
  },
  gravida: Number,
  address: String,
  doctor: String,
  bid: {
      type: String,
      unique: true,
      index: true,
  },
  registeredBy:{
    hcid: String,
    block: String,
    district: String,
  },
  ToBR : Date,
  completed: {
    type: Number,
    default: 0
  },
  isActive: Boolean,
});

newBeneficiarySchema.pre('save', async function (next) {
    const doc = this;
  
    // Check if the document is new or being modified
    if (doc.isNew) {
      const count = await mongoose.model('NewBeneficiary').countDocuments();
      doc.count = count + 1;
      const num = count + 1;
      const string = "" + num;
      const pad = "0000";
      const n = pad.substring(0, pad.length - string.length) + string;
      const randomString = Math.floor(1000 + Math.random() * 9000).toString();
      doc.bid = ("BID" + n.toString() + randomString);
    }
  
    next();
  });
  
  
const NewBeneficiary = new mongoose.model("NewBeneficiary",newBeneficiarySchema);
module.exports = NewBeneficiary;