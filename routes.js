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
    app.get('/delay-discounting', function(req, res) {
        res.sendFile(path.join(__dirname + '/tasks/delay_discount/task.html'));
    });
    app.get('/symbol-counting', function(req, res) {
        res.sendFile(path.join(__dirname + '/tasks/symbol_counting/task.html'));
    });
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
    app.get("/viz", function (req, res) {
        const db = client.db(dbName);
        const collection = db.collection('datacollections');
        collection.find({ experiment: 'delay discounting' }).toArray(function (err, discount_data) {
            assert.equal(err, null);
            var filtered = discount_data[discount_data.length - 1].data.filter(function (response) {
                return response.trial_type == "html-keyboard-response";
            });
            var indiff = [];
            var rt = [];
            var time = [];
            for (i = 0; i < filtered.length; i++) {
                indiff.push(filtered[i].indifference)
                time.push(filtered[i].time_elapsed)
                rt.push(filtered[i].rt)
            };

            function chunkArray(myArray, chunk_size) {
                var index = 0;
                var arrayLength = myArray.length;
                var tempArray = [];
                for (index = 0; index < arrayLength; index += chunk_size) {
                    myChunk = myArray.slice(index, index + chunk_size);
                    // Do something if you want with the group
                    tempArray.push(myChunk);
                }
                return tempArray;
            }
            indiff_chunk = chunkArray(indiff, 5);
            time_chunk = chunkArray(time, 5);
            rt_chunk = chunkArray(rt, 5);


            curve_data = filtered.filter(function (response) {
                return response.n_trial == 5;
            });
            curve_data.sort(function (a, b) {
                return a.cost - b.cost;
            });

            var sorted_indiff = [];
            var sorted_costs = [];
            const max_indiff = Math.max(...indiff);
            for (i = 0; i < curve_data.length; i++) {
                sorted_indiff.push(curve_data[i].indifference / max_indiff)
                sorted_costs.push(curve_data[i].cost)
            };
            res.render("viz.ejs", { subject_id: discount_data[discount_data.length - 1].subject, indiff_chunk: indiff_chunk, time_chunk: time_chunk, rt_chunk: rt_chunk, sorted_indiff: sorted_indiff, sorted_costs: sorted_costs, filtered: curve_data });
        });
    });

    app.get("/data", function (req, res) {
        const db = client.db(dbName);
        const collection = db.collection('datacollections');
        collection.find({}).toArray(function (err, discount_data) {
            assert.equal(err, null);
            res.render("data.ejs", { discount_data: discount_data });
        });
    });

    app.get("/ejs_home", function (req, res) {
        const db = client.db(dbName);
        const collection = db.collection('index_stats');
        collection.find({}).toArray(function (err, site_data) {
            assert.equal(err, null);
            var num_tasks = site_data[site_data.length - 1].num_tasks;
            var num_studies = site_data[site_data.length - 1].num_studies;
            var num_entries = site_data[site_data.length - 1].num_entries;
            res.render("../ejs_home.ejs", { num_tasks: num_tasks, num_studies: num_studies, num_entries: num_entries });
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