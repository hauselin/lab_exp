var express = require('express'); 
var app = express();
var path = require('path');

app.use(express.static(__dirname + '/tasks'));
app.use('/jsPsych', express.static(__dirname + "/jsPsych"));
app.use(express.static(path.join(__dirname, 'tasks/symbol_counting')));
app.set('symbol_count', __dirname + '/tasks/symbol_counting');

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/tasks/symbol_counting/experiment.html'));
});

var server = app.listen(8080, function() {
    console.log("Server started on port %d", server.address().port);
});