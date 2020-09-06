var express = require('express');
var router = express.Router();
var passport = require('passport');
const User = require("../models/user");
const pass = "PH6u7U_ZJZn*CuE@w=e@";

router.get("/register", function(req, res) {
    res.render("register");
});

router.post("/register", function(req, res) {
    if (req.body.password == pass) {
        var newUser = new User({username: req.body.username});
        User.register(newUser, req.body.password, function(err, user) {
            if (err) {
                //console.log(err);
                return res.render("returnUser");
            }
            passport.authenticate("local")(req, res, function() { // if this gets called, authentication was successful
                res.redirect("/");
            })
        });
    } else {
        res.render("registerError");
    }
});

router.get("/login", function(req, res) {
    res.render("login");
})

// TODO Maham: redirect back to previous page after logging in?
// https://stackoverflow.com/questions/13335881/redirecting-to-previous-page-after-authentication-in-node-js-using-passport-js
router.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login" 
}), function (req, res) {
    console.log(res);
});

router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

module.exports = router;