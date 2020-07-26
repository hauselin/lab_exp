var express = require('express');
var router = express.Router();
const helper = require('../routes/helpers/helpers')

// route for downloading consent forms
router.get("/:type/:uniquestudyid/consent", function (req, res) {
    var filename = 'consent.md'; // download filename
    var file = '../app/' + req.params.type + '/' + req.params.uniquestudyid + '/' + filename;
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

module.exports = router;