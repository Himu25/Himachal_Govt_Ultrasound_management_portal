const session = require('express-session');
const adminSessionChecker = (req, res, next) => {
    if (req.session.admin && req.cookies.user_sid) {
      res.redirect("/hcid");
    } else {
      next();
    }
  };
  module.exports = adminSessionChecker