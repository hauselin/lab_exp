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
            if(err){
                //console.log(err);
                console.log("Looks like you already have an account with us. Login to continue.");
                return res.render("register");
            }
            passport.authenticate("local")(req, res, function() { // if this gets called, authentication was successful
                res.redirect("/");
            })
        });
    } else {
        console.log("Cannot register user.")
    }
    
});

router.get("/login", function(req, res) {
    res.render("login");
})

router.post("/login", passport.authenticate("local", 
{
    successRedirect: "/",
    failureRedirect: "/login" 

}), function(req, res) {
    
});

router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

module.exports = router;