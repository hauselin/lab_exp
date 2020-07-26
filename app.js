// LOAD MODULES 
var express = require("express"),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    path = require('path'),
    DataLibrary = require('./models/datalibrary')

var showRoutes = require('./routes/show'),
    indexRoutes = require('./routes/index'),
    datalibraryRoutes = require('./routes/datalibrary'),
    vizRoutes = require('./routes/viz'),
    downloadsRoutes = require('./routes/downloads')

app.use(bodyParser.json());
app.use(express.json());
app.set("view engine", "ejs"); // use ejs template engine for rendering

mongoose.connect('mongodb+srv://datalibrary:HLXE0xme6mSJ9hCR@datalibrary.wjesv.mongodb.net/datalibrary?retryWrites=true&w=majority',
    { useUnifiedTopology: true, useNewUrlParser: true }, function (err) {
        if (err) { console.log('Not connected to database!'); } else {
            console.log('Successfully connected to database.')
        }
    }
);

// // TELL EXPRESS TO USE THE FOLLOWING LIBRARIES/FILES/ROUTES DEFINED IN ROUTES FOLDER
app.use('/jspsych', express.static(__dirname + "/jspsych"));
app.use('/libraries', express.static(__dirname + "/libraries"));
app.use('/public', express.static(__dirname + "/public"));
app.use('/tasks', express.static(__dirname + "/tasks"));
app.use('/surveys', express.static(__dirname + "/surveys"));
app.use('/studies', express.static(__dirname + "/studies"));

app.use(indexRoutes);
app.use(datalibraryRoutes);
app.use(showRoutes);
app.use(vizRoutes);
app.use(downloadsRoutes);

// Handle 404
app.use(function (req, res) {
    res.redirect('/public/404.html');
    // res.render("404.ejs");
});

// Handle 500
app.use(function (error, req, res, next) {
    res.redirect('/public/500.html');
    // res.render('500.ejs');
});

// START SERVER
const PORT = process.env.PORT || 8080; app.listen(PORT, () => { console.log(`App listening on port ${PORT}!`); });
