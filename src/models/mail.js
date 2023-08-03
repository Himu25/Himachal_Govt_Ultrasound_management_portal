require('dotenv').config()
const process = require('process');
var nodemailer = require('nodemailer');
const sendEmail = async(email,subject,html)=>{
try {
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth:{
        user:"21123@iiitu.ac.in",
        pass: '6386845325',
    },
});
await transporter.sendMail({
    from: '21123@iiitu.ac.in',
    to: email,
    subject: subject,
    html: html,
});
console.log("Email has been send");
} catch (error) {
    console.log(error," email not sent");
}
};
module.exports = sendEmail;