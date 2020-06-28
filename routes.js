const DataController = require('./DataController');

module.exports = function (app, path) {

    // GET REQUESTS
    // app.get('/delay-discounting', function(req, res) {
    //     res.sendFile(path.join(__dirname + '/tasks/delay_discount/experiment.html'));
    // });
    // app.get('/symbol-counting', function(req, res) {
    //     res.sendFile(path.join(__dirname + '/tasks/symbol_counting/experiment.html'));
    // });
    app.get('/', function (req, res) {
        res.sendFile(path.join(__dirname + '/index.html'));
    });
    app.get('/home', function (req, res) {
        res.sendFile(path.join(__dirname + '/index.html'));
    });
    app.get('/grit-short', function (req, res) {
        res.sendFile(path.join(__dirname + '/surveys/grit_short.html'))
    });

    // catch-all route to demonstrate/test ejs file
    app.get('/*', function (req, res) {
        var params = req.params;
        console.log(params);
        var var_to_display;
        if (params['0'] == '') {
            var_to_display = "you didn't specify a route; see examples below";
        } else {
            var_to_display = params['0'];
        }
        // eventually, we'll pass in data from our database to our ejs file
        res.render("test.ejs", { my_variable: var_to_display }); // looks within views dir for ejs files
    });

    // POST REQUESTS
    app.post('/submit-data', DataController.create);

}