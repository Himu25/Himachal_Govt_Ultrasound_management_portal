require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express');
const hbs = require('hbs');
const path = require('path');
const fast2sms = require('fast-two-sms')
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require('passport')
const connectMongo = require('connect-mongo');
const MongoStore = connectMongo(session);
const passportLocal = require('../src/middleware/passport-local-strategy');
const app = express();
const port = process.env.PORT || 3000;
const { send } = require('process');
const views_path = path.join(__dirname, "..", "templates/views");
const partial_path = path.join(__dirname, "..", "templates/partials")
const cron = require('node-cron');
const Token = require('./models/token');
const moment = require('moment');
const momentTimezone = require('moment-timezone');
cron.schedule('0 0 * * *', async () => {
  const currentDate = new Date();
  console.log(currentDate);
  try {
    const result = await Token.updateMany(
      { DoTE: { $lte: currentDate }, status: { $ne: 'expired' } }, 
      { $set: { status: 'expired' } }
    );
  } catch (error) {
    console.error('Error updating tokens:', error);
  }
});

hbs.registerHelper('checkTokens', function (tokens, options) {
  if (tokens.length === 0) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});
hbs.registerHelper('formatDate', function(date) {
  const toTSIndianTime = moment(date).tz('Asia/Kolkata');
  return toTSIndianTime.format('YYYY-MM-DD HH:mm:ss');
});
hbs.registerHelper('calculateTimeDifference', function(ToTS, ToTC, convertToDays) {
  const diffInMilliseconds = new Date(ToTS) - new Date(ToTC);
  const diffInHours = diffInMilliseconds / (1000 * 60 * 60);
  
  if (convertToDays) {
    const diffInDays = diffInHours / 24;
    return diffInDays.toFixed(0);
  }
  
  return diffInHours.toFixed(2);
});

app.set('views', views_path)
app.set('view engine', 'hbs')
app.use(express.static('.'));
app.use(bodyParser.json())
hbs.registerPartials(partial_path);
app.use(cookieParser());
app.use(session({
    name: "user_sid",
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store: new MongoStore({ mongooseConnection: mongoose.connection,autoRemove: 'disabled'}),
}));
app.use(passport.initialize());
app.use(passport.session());

// health_centre 
const healthCentreRouter = require("./routes/healthCentre");
app.use(healthCentreRouter);

// ultrasound_centre
const ultrasoundcentreRouter = require("./routes/ultrasoundCentre");
app.use(ultrasoundcentreRouter);

// Admin
const adminRouter = require("./routes/admin");
app.use(adminRouter);

//
// ...

require("./db/conn");
app.listen(port, function () {
    console.log(`Server is running at port no ${port}`);
})
