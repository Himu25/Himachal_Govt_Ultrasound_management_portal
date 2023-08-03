const verifyOTP = (req, res, next) => {
    const { I1, I2, I3, I4, I5, I6 } = req.body;
    const enteredOTP = `${I1}${I2}${I3}${I4}${I5}${I6}`;
    const otp = req.decodedToken.otp
    const isOTPValid = enteredOTP === otp.toString();
    req.isOTPValid = isOTPValid;
next();
};
module.exports = verifyOTP
