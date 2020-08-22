// LOAD MODULES 
var express = require("express"),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    path = require('path'),
    User = require('./models/user'),
    DataLibrary = require('./models/datalibrary')

var showRoutes = require('./routes/show'),
    indexRoutes = require('./routes/index'),
    datalibraryRoutes = require('./routes/datalibrary'),
    vizRoutes = require('./routes/viz'),
    downloadsRoutes = require('./routes/downloads'), 
    deleteRoutes = require('./routes/delete'), 
    authRoutes = require('./routes/auth')

app.use(bodyParser.json());
app.use(express.json());
app.set("view engine", "ejs"); // use ejs template engine for rendering

mongoose.connect('mongodb://localhost/datalibrary',
    { useUnifiedTopology: true, useNewUrlParser: true }, function (err) {
        if (err) { console.log('Not connected to database!'); } else {
            console.log('Successfully connected to database.')
        }
    }
);

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Welcome to Anthrope.", 
    resave: false, 
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// // TELL EXPRESS TO USE THE FOLLOWING LIBRARIES/FILES
app.use('/tasks', express.static(__dirname + "/tasks"));
app.use('/surveys', express.static(__dirname + "/surveys"));
app.use('/studies', express.static(__dirname + "/studies"));
app.use('/jsPsych', express.static(__dirname + "/jsPsych"));
app.use('/libraries', express.static(__dirname + "/libraries"));
app.use('/public', express.static(__dirname + "/public"));

app.use(indexRoutes);
app.use(datalibraryRoutes);
app.use(showRoutes);
app.use(vizRoutes);
app.use(downloadsRoutes);
app.use(deleteRoutes);
app.use(authRoutes);

// Handle 404
app.use(function (req, res) {
    res.redirect('/public/404.html');
    // res.render("404.ejs");
});

// Handle 500
app.use(function (error, req, res, next) {
    res.redirect('/public/500.html');
    console.log(error);
    // res.render('500.ejs');
});

// START SERVER
app.listen(8080);
console.log("Server started on port 8080");