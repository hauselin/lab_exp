// LOAD MODULES 
var express = require('express'); 

// INSTANTIATE THE APP
var app = express();

// GET THE CURRENT PATH
var path = require('path');

// FIND STATIC FILES
app.use(express.static(__dirname + '/tasks'));
app.use('/jsPsych', express.static(__dirname + "/jsPsych"));
app.use(express.static(path.join(__dirname, 'tasks/symbol_counting')));
app.set('symbol_count', __dirname + '/tasks/symbol_counting');

// ROUTING
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/tasks/symbol_counting/experiment.html'));
});

// START SERVER
var server = app.listen(8080, function() {
    console.log("Server started on port %d", server.address().port);
});