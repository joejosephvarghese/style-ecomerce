var createError = require("http-errors");
var express = require("express");
const flash = require("connect-flash");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const dbConnect = require("./config/connections");
const nocache = require("nocache");
var adminRouter = require("./routes/admin");
var usersRouter = require("./routes/users");
const userOtpLoginRouter = require('./routes/userOTPRouter')
const expressLayout = require("express-ejs-layouts");
const session = require("express-session");
require('dotenv').config();


var app = express();
const multer = require('multer');


app.use(expressLayout);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayout);
app.use(nocache());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));
dbConnect();

app.use(
  session({
    secret: "keyboard cat",
    key: "user_id",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60000000,
    },
  })
);



app.use("/admin", adminRouter);
app.use("/", usersRouter);


// user OTP login router
app.use('/api/user/otp-login', userOtpLoginRouter);



// catch 404 and forward to error handler
app.use(function (req, res) {
  res.render('error')
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
