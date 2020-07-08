// LOAD MODULES 
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');               // GET THE CURRENT PATH
const app = express();                      // INSTANTIATE THE APP

app.use(bodyParser.json());                 // allow app to parse any json request
app.use(express.json());
app.set("view engine", "ejs"); // use ejs template engine for rendering

// TODO Maham: connect to mongodb here

// TELL EXPRESS TO USE THE FOLLOWING LIBRARIES/FILES
app.use('/jsPsych', express.static(__dirname + "/jsPsych"));
app.use('/libraries', express.static(__dirname + "/libraries"));
app.use('/tasks', express.static(__dirname + "/tasks"));
app.use('/surveys', express.static(__dirname + "/surveys"))
app.use('/frontend', express.static(__dirname + "/frontend"));
app.use('/studies', express.static(__dirname + "/studies"));

// GET ACCESS TO THE ROUTES DEFINED IN ROUTES.JS
// require('./routes/studies')(app, path)
// require('./routes/surveys')(app, path)
var taskRoutes = require('./routes/tasks');
var studiesRoutes = require('./routes/studies');
app.use(taskRoutes)
app.use(studiesRoutes)


// START SERVER
app.listen(8080);
console.log("Server started on port 8080");