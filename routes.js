const DataController = require('./DataController');

module.exports = function (app, path) {

    // GET REQUESTS
    // app.get('/delay-discounting', function(req, res) {
    //     res.sendFile(path.join(__dirname + '/tasks/delay_discount/experiment.html'));
    // });
    // app.get('/symbol-counting', function(req, res) {
    //     res.sendFile(path.join(__dirname + '/tasks/symbol_counting/experiment.html'));
    // });
    app.get('/home', function (req, res) {
        res.sendFile(path.join(__dirname + '/index.html'));
    });
    app.get('/grit_short', function (req, res) {
        res.sendFile(path.join(__dirname + '/surveys/grit_short.html'))
    });

    // catch-all route to demonstrate/test ejs file
    app.get('/*', function (req, res) {
        var params = req.params;
        console.log(params);
        res.render("test.ejs", { my_variable: params['0'] }); // looks within views dir for ejs files
    })

    // POST REQUESTS
    app.post('/submit-data', DataController.create);

}