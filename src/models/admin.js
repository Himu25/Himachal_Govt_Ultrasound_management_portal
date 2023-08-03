const mongoose = require('mongoose');
const adminSchema = new mongoose.Schema({
    type: String,
    username:String,
    password:String,
    })
const Admin = new mongoose.model("Admin",adminSchema);
module.exports = Admin;