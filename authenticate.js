// ---> Passport Authentication Setup

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');

passport.use(new LocalStrategy(User.authenticate())); // User.authenticate is supplied by passport local mongoose, If you aint using passport then you need to use the authintication logic dicussed in session for authentication
// Since we are using sessions, we need to serialize and deserialize user
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());