// LOAD MODULES 
const express = require('express'); 
const bodyParser = require('body-parser');
const path = require('path');       // GET THE CURRENT PATH
const app = express();              // INSTANTIATE THE APP

app.use(bodyParser.json());         // allow app to parse any json request
app.use(express.json());

app.use('/jsPsych', express.static(__dirname + "/jsPsych"));
app.use(express.static(path.join(__dirname, 'tasks/symbol_counting')));
app.use('/libraries', express.static(__dirname + "/libraries"));

require('./routes')(app, path)

// START SERVER
const server = app.listen(8080, function() {
    console.log("Server started on port %d", server.address().port);
});