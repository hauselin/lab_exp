const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/jspsych', 
{ useUnifiedTopology: true, useNewUrlParser: true });

var symbolSchema = new mongoose.Schema({}, { strict: false });
var SymbolCount = mongoose.model('SymbolCount', symbolSchema);
var DelayDiscount = mongoose.model('DelayDiscount', symbolSchema);

module.exports = function(app, path) {

    app.get('/delay-discounting', function(req, res) {
        res.sendFile(path.join(__dirname + '/tasks/delay_discount/experiment.html'));
    });
    
    app.get('/symbol-counting', function(req, res) {
        res.sendFile(path.join(__dirname + '/tasks/symbol_counting/experiment.html'));
    });

    app.post('/submit-symbol-data', function(req, res) {
        SymbolCount.create({
            data: req.body
        });
        console.log(req.body);
        res.end();
    });

    app.post('/submit-delay-data', function(req, res) {
        DelayDiscount.create({
            data: req.body
        });
        console.log(req.body);
        res.end();
    });

}