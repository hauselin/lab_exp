// LOAD MODULES 
var express = require("express"),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    path = require('path'),
    DataLibrary = require('./models/datalibrary')

var taskRoutes = require('./routes/tasks'),
    studiesRoutes = require('./routes/studies'),
    surveysRoutes = require('./routes/surveys'),
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
app.use(taskRoutes);
app.use(studiesRoutes);
app.use(surveysRoutes);
app.use(indexRoutes); // TODO Maham: work on index routes
app.use(datalibraryRoutes);
app.use(vizRoutes);
// app.use(downloadsRoutes); // TODO Maham: work on download routes

app.use('/jsPsych', express.static(__dirname + "/jsPsych"));
app.use('/libraries', express.static(__dirname + "/libraries"));
app.use('/tasks', express.static(__dirname + "/tasks"));
app.use('/surveys', express.static(__dirname + "/surveys"));
app.use('/studies', express.static(__dirname + "/studies"));
app.use('/public', express.static(__dirname + "/public"));

// require('./routes')(app, path)

// START SERVER
app.listen(8080);
console.log("Server started on port 8080");