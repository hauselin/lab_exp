module.exports = function (app, path) {
    // GET REQUESTS

    // TODO Maham: index route
    // homepage
    app.get('/', function (req, res) {
        // DEMO query database to look for documents matching certain criteria
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

}