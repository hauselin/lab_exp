var mongoose = require('mongoose');
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String
});

UserSchema.plugin(passportLocalMongoose); // uses the passportLocalMongoose package to add methods that come with it for the UserSchema to use, necessary for authentication

module.exports = mongoose.model("User", UserSchema);