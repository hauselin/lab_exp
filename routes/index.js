var express = require("express");
var router = express.Router();
var DataLibrary = require("../models/datalibrary")

router.get('/', function (req, res) {

    // EXAMPLES database querying
    console.log('\n\n\nBEGIN QUERIES')

    // .findOne() takes 4 arguments: filter, select, options, callback
    // this example uses promises instead of callback function: https://mongoosejs.com/docs/promises.html
    // no filtering; select subject field, drop _id field; sort by time (-1 is descending order)
    DataLibrary.findOne({}, { subject: 1, _id: 0 }, { sort: { time: -1 } })
        .then(doc => {
            console.log('EXAMPLE 1:');
            console.log(doc);
        })
        .catch(err => { console.log(err) });

    // select one more field utc_datatime
    DataLibrary.findOne({}, { subject: 1, uniquestudyid: 1, utc_datetime: 1, _id: 0 }, { sort: { time: -1 } })
        .then(doc => {
            console.log('EXAMPLE 2:');
            console.log(doc);
        })
        .catch(err => console.log(err));

    DataLibrary.findOne({ uniquestudyid: 'gritshort' }, { utc_datetime: 1, _id: 0 }, { sort: { time: 1 } })
        .then(doc => {
            console.log('EXAMPLE 3:');
            console.log(doc);
        })
        .catch(err => console.log(err));

    DataLibrary.find({ uniquestudyid: 'gritshort' }, { utc_datetime: 1, _id: 0 }, { sort: { time: -1 }, limit: 3 })
        .then(doc => {
            console.log('EXAMPLE 4:');
            console.log(doc);
            console.log(doc[0].utc_datetime); // undefined because it's a cursor/reference (see lean example below)
        })
        .catch(err => console.log(err));

    // lean option converts cursor/reference to javascript object
    // https://mongoosejs.com/docs/tutorials/lean.html
    DataLibrary.find({}, { subject: 1, _id: 0, utc_datetime: 1 }, { sort: { time: -1 }, lean: true, limit: 3 })
        .then(doc => {
            console.log('EXAMPLE 5:')
            console.log(doc);
            console.log(doc[0].subject) // will be defined only if lean: true
        })
        .catch(err => console.log(err));

    // https://mongoosejs.com/docs/tutorials/lean.html#when-to-use-lean
    DataLibrary.findOne({ uniquestudyid: 'delaydiscount', 'utc_date.month': 7 }, { subject: 1, utc_datetime: 1, uniquestudyid: 1 }, { sort: { time: -1 } }).lean()
        .then(doc => {
            console.log("EXAMPLE 6: ")
            console.log(doc)
            console.log(typeof doc)
        })
        .catch(err => { console.log(err) });

    // multiple queries
    Promise.all([
        DataLibrary.findOne({ uniquestudyid: 'delaydiscount' }, { subject: 1, utc_datetime: 1, uniquestudyid: 1 }).lean(),
        DataLibrary.findOne({ uniquestudyid: 'gritshort' }, { subject: 1, utc_datetime: 1, uniquestudyid: 1 }).lean()
    ])
        .then(([doc1, doc2]) => {
            console.log("EXAMPLE 7: ")
            console.log(doc1);
            console.log(doc2.subject);
        })
        .catch(err => { console.log(err) });

    console.log('END OF QUERIES (note the asynchronous output!)\n\n')

    res.render("index.ejs", { num_tasks: 1, num_studies: 2, num_entries: 3, entries_delaydiscount: 4, entries_stroop: 5, entries_symbolcount: 6, entries_mentalmath: 6 });
});

router.get('/tasks', function (req, res) {
    Promise.all([
        DataLibrary.find({uniquestudyid: 'delaydiscount'}).lean(),
        DataLibrary.find({uniquestudyid: 'stroop'}).lean(),
        DataLibrary.find({uniquestudyid: 'symbolcount'}).lean(),
        DataLibrary.find({uniquestudyid: 'updatemath'}).lean()
    ])
        .then(([delaydiscount, stroop, symbolcount, updatemath]) => {
            res.render("tasks.ejs", { entries_delaydiscount: delaydiscount.length, entries_stroop: stroop.length, entries_symbolcount: symbolcount.length, entries_mentalmath: updatemath.length });
        })
});

module.exports = router;