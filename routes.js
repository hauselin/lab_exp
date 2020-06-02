const path = require('path');

module.exports = (app) => {
    // ROUTING
    app.get('/', function(req, res) {
        res.sendFile(path.join(__dirname + '/tasks/symbol_counting/experiment.html'));
    });
}