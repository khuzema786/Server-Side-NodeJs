var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var session = require('express-session');
var FileStore = require('session-file-store')(session); // Note: session-file-store takes "session" as parameter

var passport = require('passport'); // Passport Authentication
var authenticate = require('./authenticate');
var config = require('./config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');
var uploadRouter = require('./routes/uploadRouter');
var favoriteRouter = require('./routes/favoriteRouter');


// Conectiong to Mongodb server
const mongoose = require('mongoose');

const Dishes = require('./models/dishes');

const url = config.mongoUrl; //'mongodb://localhost:27017/conFusion' this is exported from config.js
const connect = mongoose.connect(url);

connect.then((db) => {
    console.log("Connected correctly to server");
}, (err) => { console.log(err); });

var app = express();

// Secure traffic only - Redirecting to https port for secure server
app.all('*', (req, res, next) => {

  // If incoming request is already secure, go to next middleware
  if (req.secure) {
    return next();
  }
  else {
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ---> Using Passport Authentication with JWT tokens
app.use(passport.initialize());

// ---> USE POSTMAN TO TEST ALL THE ROUTES

// ---> Incoming user can access index and user endpoint without authentication, but not others
app.use('/', indexRouter);
app.use('/users', usersRouter);

// ---> Routes middleware to the static and dynamic pages
app.use(express.static(path.join(__dirname, 'public')));

app.use('/dishes',dishRouter);
app.use('/promotions',promoRouter);
app.use('/leaders',leaderRouter);
app.use('/favorites',favoriteRouter);
app.use('/imageUpload',uploadRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
