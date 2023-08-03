const mongoose = require('mongoose');
// import mongoose from "mongoose";
mongoose.connect('mongodb://127.0.0.1:27017/Ultrasound',{useNewUrlParser: true}
).then(()=>{
    console.log("Connected Sucessfully");
}).catch(()=>{
    console.log("No connection");
})