var express = require("express");
var router = express.Router();
var DataLibrary = require("../models/datalibrary")

router.get('/', function (req, res) {

    // EXAMPLES database querying
    console.clear();
    console.log('\n\n\nBEGIN')

    // .findOne takes 4 arguments: filter, select, options, callback
    // select subject field; drop _id field; sort by time (descending order); callback function
    // this example uses promises: https://mongoosejs.com/docs/promises.html
    DataLibrary.findOne({}, { subject: 1, _id: 0 }, { sort: { time: -1 } }).
        then(doc => {
            console.log('EXAMPLE 1:');
            console.log(doc);
        }).
        catch(err => { console.log(err) });

    DataLibrary.findOne({}, { subject: 1, uniquestudyid: 1, utc_datetime: 1, _id: 0 }, { sort: { time: -1 } }).
        then(doc => {
            console.log('EXAMPLE 2:');
            console.log(doc);
        }).
        catch(err => console.log(err));

    DataLibrary.findOne({ uniquestudyid: 'gritshort' }, { utc_datetime: 1, _id: 0 }, { sort: { time: 1 } }).
        then(doc => {
            console.log('EXAMPLE 3:');
            console.log(doc);
        }).
        catch(err => console.log(err));

    DataLibrary.find({ uniquestudyid: 'gritshort' }, { utc_datetime: 1, _id: 0 }, { sort: { time: -1 }, limit: 3 }).
        then(doc => {
            console.log('EXAMPLE 4:');
            console.log(doc);
            console.log(doc[0].utc_datetime); // undefined because it's a cursor/reference (see lean example below)
        }).
        catch(err => console.log(err));

    // lean option converts cursor/reference to javascript object
    // https://mongoosejs.com/docs/tutorials/lean.html
    DataLibrary.find({}, { subject: 1, _id: 0, utc_datetime: 1 }, { sort: { time: -1 }, lean: true, limit: 3 }).
        then(doc => {
            console.log('EXAMPLE 5:')
            console.log(doc);
            console.log(doc[0].subject) // will be defined only if lean: true
        }).
        catch(err => console.log(err));

    // https://mongoosejs.com/docs/tutorials/lean.html#when-to-use-lean
    DataLibrary.findOne({ uniquestudyid: 'delaydiscount', 'utc_date.month': 7 }, { subject: 1, utc_datetime: 1, uniquestudyid: 1 }, { sort: { time: -1 } }).lean().
        then(doc => {
            console.log("EXAMPLE 6: ")
            console.log(doc)
            console.log(typeof doc)
        }).
        catch(err => { console.log(err) });

    // multiple queries
    Promise.all([
        DataLibrary.findOne({ uniquestudyid: 'delaydiscount' }, { subject: 1, utc_datetime: 1, uniquestudyid: 1 }).lean(),
        DataLibrary.findOne({ uniquestudyid: 'gritshort' }, { subject: 1, utc_datetime: 1, uniquestudyid: 1 }).lean()
    ]).then(([doc1, doc2]) => {
        console.log("EXAMPLE 7: ")
        console.log(doc1);
        console.log(doc2.subject);
    });

    console.log('END (note the asynchronous output!)\n\n')

    res.render("index.ejs", { num_tasks: 1, num_studies: 2, num_entries: 3, entries_delaydiscount: 4, entries_stroop: 5, entries_symbolcount: 6, entries_mentalmath: 6 });
});

module.exports = router;