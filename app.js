// LOAD MODULES 
const express = require('express'); 
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const path = require('path');       // GET THE CURRENT PATH
const app = express();              // INSTANTIATE THE APP

app.use(bodyParser.json());         // allow app to parse any json request
app.use(express.json());

mongoose.connect('mongodb://localhost/jspsych', 
{ useUnifiedTopology: true, useNewUrlParser: true });

var symbolSchema = new mongoose.Schema({}, { strict: false });
var SymbolCount = mongoose.model('SymbolCount', symbolSchema);

// FIND STATIC FILES
app.use('/jsPsych', express.static(__dirname + "/jsPsych"));
app.use(express.static(path.join(__dirname, 'tasks/symbol_counting')));
app.use('/libraries', express.static(__dirname + "/libraries"));

// ROUTING
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/tasks/symbol_counting/experiment.html'));
});

app.post('/submit-data', function(req, res) {
    SymbolCount.create({
        data: req.body
    });
    console.log(req.body);
    res.end();
});

// START SERVER
const server = app.listen(8080, function() {
    console.log("Server started on port %d", server.address().port);
});