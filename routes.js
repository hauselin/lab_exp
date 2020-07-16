const DataController = require('./DataController');
DataLibrary = DataController.DataLibrary;

module.exports = function (app, path) {
    // POST REQUESTS
    app.post('/submit-data', DataController.create);

    // GET REQUESTS
    // homepage
    app.get('/', function (req, res) {
        // DEMO query database to look for documents matching certain criteria
        DataLibrary.find({ 'utc_date.year': 2020, 'utc_date.month': 7 }, function (err, data) {
            if (err) {
                console.log(err);
            } else {
                console.log(data);
            }
        });
        // TODO Frank: retrieve values by querying database
        // DataLibrary.find({}, function (err, data) {
        //     let x = data.map(a => a.toObject().subject); // unique subjects
        //     let y = new Set(x).size; // unique subjects
        //     console.log('subjects: ' + x);
        //     console.log('unique subjects: ' + y);
        //     var num_tasks = y; // wrong! just demo purpooses for now
        //     var num_studies = y; // same... wrong!
        //     var num_entries = data.length;
        //     res.render("index.ejs", { num_tasks: num_tasks, num_studies: num_studies, num_entries: num_entries });
        // });
        DataLibrary.distinct('task', function (err, tasks) {
            if (err) {
                console.log(err);
            }
            DataLibrary.distinct('experiment', function (err, studies) {
                if (err) {
                    console.log(err);
                }
                DataLibrary.distinct('_id', function (err, entries) {
                    if (err) {
                        console.log(err);
                    }
                    DataLibrary.distinct('_id', { task: "delay discounting" }, function (err, entries_delaydiscount) {
                        DataLibrary.distinct('_id', { task: "stroop" }, function (err, entries_stroop) {
                            DataLibrary.distinct('_id', { task: "symbol count" }, function (err, entries_symbolcount) {
                                DataLibrary.distinct('_id', { task: "mental math" }, function (err, entries_mentalmath) {
                                    res.render("index.ejs", { num_tasks: tasks.length, num_studies: studies.length, num_entries: entries.length, entries_delaydiscount: entries_delaydiscount.length, entries_stroop: entries_stroop.length, entries_symbolcount: entries_symbolcount.length, entries_mentalmath: entries_mentalmath.length });
                                })
                            })
                        })
                    })
                })
            })
        })
    });

    // STUDIES
    // studyA
    app.get('/studyA', function (req, res) {
        res.sendFile(path.join(__dirname + '/studies/studyA/runstudy.html'))
    });

    // TASK TEMPLATES
    app.get('/symbol-count', function (req, res) {
        res.sendFile(path.join(__dirname + '/tasks/symbol_count/task.html'));
    });
    app.get('/stroop', function (req, res) {
        res.sendFile(path.join(__dirname + '/tasks/stroop/task.html'));
    });

    // SURVEY TEMPLATES
    app.get('/grit-short', function (req, res) {
        res.sendFile(path.join(__dirname + '/surveys/grit_short/task.html'));
    });
    app.get('/bigfive-aspect', function (req, res) {
        res.sendFile(path.join(__dirname + '/surveys/bigfive_aspect/task.html'));
    });

    // TODO Maham: work on dynamic routes
    app.get('/:uniquestudyid', function (req, res) {
        res.sendFile(path.join(__dirname + '/tasks/' + req.params.uniquestudyid + '/task.html'));  // for now only delay discounting task works
    });


    // visualizations (dynamic route)
    app.get("/:uniquestudyid/viz", function (req, res) {
        res.render('viz/' + req.params.uniquestudyid + ".ejs"); // render {uniquestudyid}.ejs in views directory
    });

    // DEMO download csv file: grit_short.csv
    app.get('/dl', function (req, res) {
        const file = path.join(__dirname + '/surveys/grit_short/items.csv');
        const filename = 'dl.csv';
        res.download(file, filename, function (err) {
            if (err) {
                console.log(err);
            }
        });
    });

    // DEMO download csv string
    // https://stackoverflow.com/questions/18306013/how-to-export-csv-nodejs/39652522
    app.get('/dl2', function (req, res) {
        // TODO: Maham see comment below
        // JUST A DEMO! JSON2CSV should be elsewhere (Maham, can you help move it elsewhere?) ! (jspsych's function to convert its json data to csv)
        function json2csv(objArray) {
            // https://github.com/jspsych/jsPsych/blob/83980085ef604c815f0d97ab55c816219e969b84/jspsych.js#L1565
            var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
            var line = '';
            var result = '';
            var columns = [];
            var i = 0;
            for (var j = 0; j < array.length; j++) {
                for (var key in array[j]) {
                    var keyString = key + "";
                    keyString = '"' + keyString.replace(/"/g, '""') + '",';
                    if (!columns.includes(key)) {
                        columns[i] = key;
                        line += keyString;
                        i++;
                    }
                }
            }
            line = line.slice(0, -1);
            result += line + '\r\n';
            for (var i = 0; i < array.length; i++) {
                var line = '';
                for (var j = 0; j < columns.length; j++) {
                    var value = (typeof array[i][columns[j]] === 'undefined') ? '' : array[i][columns[j]];
                    var valueString = value + "";
                    line += '"' + valueString.replace(/"/g, '""') + '",';
                }

                line = line.slice(0, -1);
                result += line + '\r\n';
            }
            return result;
        }
        // create some dummy data for testing purposes
        const csvstring = json2csv([{ trial: 1, rt: 1 }, { trial: 2, rt: 2 }, { trial: 3, rt: 3, acc: 0 }]);
        console.log(csvstring); // just checking the output
        res.attachment('dl2.csv'); // filename
        // res.status(200).send('abc,cde\n11,22'); // csv string to save inside dl2.csv (this will be the CSV representation of jspsych's data)
        res.status(200).send(csvstring); // csv string to save inside dl2.csv (this will be the CSV representation of jspsych's data)
    });

    // let subjects download consent for md file (dynamic route)
    app.get("/:type/:uniquestudyid/consent", function (req, res) {
        const filename = 'consent.md'; // download filename
        var file = path.join(__dirname + '/' + req.params.type + '/' + req.params.uniquestudyid + '/consent.md');
        res.download(file, filename, function (err) {
            if (err) {
                console.log(err);
            }
        });
    });
}