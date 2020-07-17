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

mongoose.connect('mongodb://localhost/datalibrary',
    { useUnifiedTopology: true, useNewUrlParser: true }, function (err) {
        if (err) { console.log(err); } else {
            console.log('Successfully connected to database.')
        }
    }
);

// // TELL EXPRESS TO USE THE FOLLOWING LIBRARIES/FILES/ROUTES DEFINED IN ROUTES FOLDER
app.use('/tasks', express.static(__dirname + "/tasks"));
app.use('/surveys', express.static(__dirname + "/surveys"));
app.use('/studies', express.static(__dirname + "/studies"));
app.use('/jsPsych', express.static(__dirname + "/jsPsych"));
app.use('/libraries', express.static(__dirname + "/libraries"));
app.use('/public', express.static(__dirname + "/public"));

app.use(showRoutes);
app.use(indexRoutes); // TODO Maham: work on index routes
app.use(datalibraryRoutes);
app.use(vizRoutes);
// app.use(downloadsRoutes); // TODO Maham: work on download routes

// Handle 404
// TODO FRANK: put 404 page in views and render it whenever people navigate to a route that doesn't exist ('*' is a catch-all route)
app.use(function (req, res) {
    res.send("where do you think you are going??? Frank, can you render Leap's 404 ejs file here?");
});

// TODO Frank: same as above
// Handle 500
app.use(function (error, req, res, next) {
    res.send('500: Internal Server Error', 500);
});

// START SERVER
app.listen(8080);
console.log("Server started on port 8080");