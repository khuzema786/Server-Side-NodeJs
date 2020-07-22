// ---> User schema to store user info

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose'); // This will add username and hash-passwords schema in mongoose

var User = new Schema({
    admin:   {
        type: Boolean,
        default: false
    }
});

User.plugin(passportLocalMongoose); // Add username and hash-passwords schema automatically

module.exports = mongoose.model('User', User);