var express = require('express');
var router = express.Router();
const helper = require('../routes/helpers/helpers');
var DataLibrary = require("../models/datalibrary")

// route for downloading consent forms
router.get("/:type/:uniquestudyid/consent", function (req, res) {
    var filename = 'consent.md'; // download filename
    var file = '../lab_exp/' + req.params.type + '/' + req.params.uniquestudyid + '/' + filename;
    // console.log(file);
    res.download(file, filename, function (err) {
        if (err) {
            console.log(err);
        }
    });
});

// DEMO download csv file: grit_short.csv
router.get('/dl', function (req, res) {
    var filename = 'dl.csv';
    var file = '../lab_exp/surveys/gritshort/items.csv';
    res.download(file, filename, function (err) {
        if (err) {
            console.log(err);
        }
    });
});

// DEMO download csv string
// https://stackoverflow.com/questions/18306013/how-to-export-csv-nodejs/39652522
router.get('/dl2', function (req, res) {
    // create some dummy data for testing purposes
    const csvstring = helper.json2csv([{ trial: 1, rt: 1 }, { trial: 2, rt: 2 }, { trial: 3, rt: 3, acc: 0 }]);
    console.log(csvstring); // just checking the output
    res.attachment('dl2.csv'); // filename
    // res.status(200).send('abc,cde\n11,22'); // csv string to save inside dl2.csv (this will be the CSV representation of jspsych's data)
    res.status(200).send(csvstring); // csv string to save inside dl2.csv (this will be the CSV representation of jspsych's data)
});

router.get('/dl1', function(req, res) {
    // Download the most recent document (regardless of task)
    DataLibrary.findOne({}, {}, { sort: { time: -1 } }).then(doc => {
        console.log(doc);
        // var datastring = helper.json2csv([doc]);
        // res.attachment('dl1.csv');
        // res.status(200).send(datastring);
    })
    .catch(err => {console.log(err) });
    
});

router.get('/:type/:uniquestudyid/d/:n', function(req, res) {
    // Download most recent n document(s) for a given task
    DataLibrary.find({ uniquestudyid: req.params.uniquestudyid }, {},
        { sort: { time: -1 }, limit: Number(req.params.n) }).then(doc => {
             console.log(doc);
             // use for loop to convert them to csv, then download
        }) 
});

router.get('/:type/:uniquestudyid/d/:yyyy', function(req, res) {
    // Filter and download documents by year for a given task
    DataLibrary.find({ "utc_date.year": req.params.yyyy, uniquestudyid: req.params.uniquestudyid }, {},
        {}).then(doc => {
             console.log(doc);
             // use for loop to convert them to csv, then download
        }) 

});

router.get('/:type/:uniquestudyid/d/:yyyy/:mm', function(req, res) {
    // Filter and download documents by year and month for a given task
    DataLibrary.find({ "utc_date.year": req.params.yyyy, "utc_date.month": req.params.mm,
     uniquestudyid: req.params.uniquestudyid }, {}, {}).then(doc => {
         console.log(doc);
         // use for loop to convert them to csv, then download
    }) 

});

router.get('/:type/:uniquestudyid/d/:yyyy/:mm/:dd', function(req, res) {
    // Filter and download documents by year, month, and day for a given task
    DataLibrary.find({ "utc_date.year": req.params.yyyy, "utc_date.month": req.params.mm, "utc_date.day": req.params.dd,
     uniquestudyid: req.params.uniquestudyid }, {}, {}).then(doc => {
         console.log(doc);
         // use for loop to convert them to csv, then download
    }) 

});


module.exports = router;