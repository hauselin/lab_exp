const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/jspsych', 
{ useUnifiedTopology: true, useNewUrlParser: true });

var symbolSchema = new mongoose.Schema({}, { strict: false });
var SymbolCount = mongoose.model('SymbolCount', symbolSchema);

module.exports = function(app, path) {
    app.get('/', function(req, res) {
        res.sendFile(path.join(__dirname + '/tasks/symbol_counting/experiment.html'));
    });

    app.post('/submit-symbol-data', function(req, res) {
        SymbolCount.create({
            data: req.body
        });
        console.log(req.body);
        res.end();
    });

}