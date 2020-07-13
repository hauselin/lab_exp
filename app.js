// LOAD MODULES 
var express     = require("express"),
    app         = express(),
    bodyParser  = require('body-parser'),
    mongoose    = require('mongoose'),
    path        = require('path')

var taskRoutes      = require('./routes/tasks'),
    studiesRoutes   = require('./routes/studies'),
    surveysRoutes   = require('./routes/surveys')


app.use(bodyParser.json());                 
app.use(express.json());
app.set("view engine", "ejs"); // use ejs template engine for rendering

mongoose.connect('mongodb://localhost/datalibrary',
{ useUnifiedTopology: true, useNewUrlParser: true });
// TODO Maham: catch error if fail to connect to mongodb

// TELL EXPRESS TO USE THE FOLLOWING LIBRARIES/FILES/ROUTES DEFINED IN ROUTES FOLDER
app.use('/jsPsych', express.static(__dirname + "/jsPsych"));
app.use('/libraries', express.static(__dirname + "/libraries"));
app.use('/tasks', express.static(__dirname + "/tasks"));
app.use('/surveys', express.static(__dirname + "/surveys"))
app.use('/frontend', express.static(__dirname + "/frontend"));
app.use('/studies', express.static(__dirname + "/studies"));
app.use(taskRoutes);
app.use(studiesRoutes);
app.use(surveysRoutes);

require('./routes')(app, path)


// START SERVER
app.listen(8080);
console.log("Server started on port 8080");