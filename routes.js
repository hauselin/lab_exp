const DataController = require('./DataController');

// CONNECT TO MONGO DATABASES
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const { time } = require('console');
// Connection URL
const url = 'mongodb://localhost:27017';
// Database Name
const dbName = 'jspsych';
// Create a new MongoClient
const client = new MongoClient(url);

// Use connect method to connect to the Server
client.connect(function (err) {
    assert.equal(null, err);
    console.log("Connected successfully to database");
});

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
    app.get('/bigfive-aspect', function (req, res) {
        res.sendFile(path.join(__dirname + '/surveys/bigfive_aspect.html'))
    });

    // Add data ejs route
    app.get("/data", function (req, res) {
        const db = client.db(dbName);
        const collection = db.collection('datacollections');
        collection.find({experiment: 'delay discounting'}).toArray(function (err, discount_data) {
            assert.equal(err, null);
            var filtered = discount_data[discount_data.length - 1].data.filter(function(response) {
                return response.trial_type == "html-keyboard-response";
            });
            // var indiff = [filtered[filtered.length - 1].indifference];
            // var rt = [filtered[filtered.length - 1].rt];
            // var time = [filtered[filtered.length - 1].time_elapsed];
            var indiff = [];
            var rt = [];
            var time = [];
            for (i = 0; i < filtered.length; i++) {
                indiff.push(filtered[i].indifference)
                time.push(filtered[i].time_elapsed)
                rt.push(filtered[i].rt)
            };
            res.render("data.ejs", { subject_id: discount_data[discount_data.length - 1].subject, indiff: indiff, time: time, rt: rt });
        });
    });

    app.get("/viz", function (req, res) {
        const db = client.db(dbName);
        const collection = db.collection('datacollections');
        collection.find({}).toArray(function (err, discount_data) {
            assert.equal(err, null);
            res.render("viz.ejs", { discount_data: discount_data });
        });
    });

    // catch-all route to demonstrate/test ejs file
    // app.get('/*', function (req, res) {
    //     var params = req.params;
    //     console.log(params);
    //     var var_to_display;
    //     if (params['0'] == '') {
    //         var_to_display = "you didn't specify a route; see examples below";
    //     } else {
    //         var_to_display = params['0'];
    //     }
    //     // eventually, we'll pass in data from our database to our ejs file
    //     res.render("test.ejs", { my_variable: var_to_display }); // looks within views dir for ejs files
    // });

    // POST REQUESTS
    app.post('/submit-data', DataController.create);
}