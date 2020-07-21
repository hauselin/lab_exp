var express = require("express");
var router = express.Router();
var DataLibrary = require("../models/datalibrary")

router.get('/', function (req, res) {
    // TODO Maham/Frank: move remaining contents of routes.js here
    // render {uniquestudyid}.ejs in views directory
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
    res.render("index.ejs", { num_tasks: 1, num_studies: 2, num_entries: 3, entries_delaydiscount: 4, entries_stroop: 5, entries_symbolcount: 6, entries_mentalmath: 6 });
});

module.exports = router;