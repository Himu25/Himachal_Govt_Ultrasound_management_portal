const jwt = require("jsonwebtoken");

function verifyCookieToken(cookieName) {
    return function (req, res, next) {
        const token = req.cookies[cookieName];
        if (!token) {
            return res.status(401).json({ message: `Token '${cookieName}' not provided` });
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.decodedToken = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ message: `Token '${cookieName}' is invalid` });
        }
    };
}

module.exports = verifyCookieToken;
