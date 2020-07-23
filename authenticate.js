// ---> Passport Authentication Setup

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');

var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

var config = require('./config.js');


passport.use(new LocalStrategy(User.authenticate())); // User.authenticate is supplied by passport local mongoose, If you aint using passport then you need to use the authintication logic dicussed in session for authentication
// Since we are using sessions, we need to serialize and deserialize user
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// JWT
exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey, // Helps us to create JWT with Payload(user) and Secret Key and Options(expiresIn)
        {expiresIn: 3600}); // Seconds after which the token is expired
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); // Specifies how JWT should be extracted from incoming requests
opts.secretOrKey = config.secretKey; // Supply the secret key

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                return done(err, false); // done is callback that passport will pass to our strategy.. It takes 3 parameters error, user ?, info ?
            }
            else if (user) {
                return done(null, user); // If user is not null, no error and user is passed
            }
            else {
                return done(null, false);
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt', {session: false}); // It will take JWT strategy as parameter and no session is created