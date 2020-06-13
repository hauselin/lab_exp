const DataController = require('./DataController');

module.exports = function(app, path) {

    // GET REQUESTS
    app.get('/delay-discounting', function(req, res) {
        res.sendFile(path.join(__dirname + '/tasks/delay_discount/experiment.html'));
    });
    app.get('/symbol-counting', function(req, res) {
        res.sendFile(path.join(__dirname + '/tasks/symbol_counting/experiment.html'));
    });


    // POST REQUESTS
    app.post('/submit-symbol-data', DataController.create);
    app.post('/submit-delay-data', DataController.create);

}