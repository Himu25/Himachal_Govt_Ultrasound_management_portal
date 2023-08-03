const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour in milliseconds
    max: 100, // maximum number of requests per windowMs
    message: "Too many requests from your IP address. Please try again later.", // Custom error message
});
module.exports = limiter
