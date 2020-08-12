var express = require('express');
var router = express.Router();
const helper = require('../routes/helpers/helpers');
const DataLibrary = require("../models/datalibrary");

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

router.get('/d1', function (req, res) {
    // Download the most recent document (regardless of task)
    DataLibrary.findOne({}, { data: 1, _id: 0 }, { sort: { time: -1 } }).lean()
        .then(doc => {
            if (doc.data.length > 0) {
                const filename = doc.type + "_" + doc.uniquestudyid + "_" + doc.subject + '.csv';
                var datastring = helper.json2csv(doc.data);
                res.attachment(filename);
                res.status(200).send(datastring);
            } else {
                res.status(200).end(); // empty page (use flash?)  
            }
        })
        .catch(err => { console.log(err) });

});

router.get('/:type/:uniquestudyid/:dn', function (req, res) {
    // Download most recent n document(s) for a given task
    DataLibrary.find({ uniquestudyid: req.params.uniquestudyid }, { data: 1, _id: 0 },
        { sort: { time: -1 }, limit: Number(req.params.dn.slice(1, 2)) }).lean()
        .then(doc => {
            console.log(doc)
            if (doc.length > 0) {
                const filename = req.params.dn + "_" + req.params.type + "_" + req.params.uniquestudyid + ".csv";
                var datastring = helper.doc2datastring(doc);
                res.attachment(filename);
                res.status(200).send(datastring);
            } else {
                res.status(200).end(); // empty page (use flash?) 
            }
        })
});

router.get('/:type/:uniquestudyid/d/:yyyy', function (req, res) {
    // Filter and download documents by year for a given task
    DataLibrary.find(
        {
            uniquestudyid: req.params.uniquestudyid,
            "utc_date.year": Number(req.params.yyyy)
        },
        { data: 1, _id: 0 },
        { sort: { time: -1 } }).lean()
        .then(doc => {
            if (doc.length > 0) {
                const filename = "d" + req.params.yyyy + "_" + req.params.type + "_" + req.params.uniquestudyid + ".csv";
                var datastring = helper.doc2datastring(doc);
                res.attachment(filename);
                res.status(200).send(datastring);
            } else {
                res.status(200).end(); // empty page (use flash?) 
            }
        })
});

router.get('/:type/:uniquestudyid/d/:yyyy/:mm', function (req, res) {
    // Filter and download documents by year and month for a given task
    DataLibrary.find(
        {
            uniquestudyid: req.params.uniquestudyid,
            "utc_date.year": Number(req.params.yyyy),
            "utc_date.month": Number(req.params.mm)
        },
        { data: 1, _id: 0 },
        { sort: { time: -1 } }).lean()
        .then(doc => {
            if (doc.length > 0) {
                const filename = "d" + req.params.yyyy + "_" + req.params.mm + "_" + req.params.type + "_" + req.params.uniquestudyid + ".csv";
                var datastring = helper.doc2datastring(doc);
                res.attachment(filename);
                res.status(200).send(datastring);
            } else {
                res.status(200).end(); // empty page (use flash?)
            }
        })
});

router.get('/:type/:uniquestudyid/d/:yyyy/:mm/:dd', function (req, res) {
    // Filter and download documents by year, month, and day for a given task
    DataLibrary.find(
        {
            uniquestudyid: req.params.uniquestudyid,
            "utc_date.year": Number(req.params.yyyy),
            "utc_date.month": Number(req.params.mm),
            "utc_date.day": Number(req.params.dd)
        },
        { data: 1, _id: 0 },
        { sort: { time: -1 } }).lean()
        .then(doc => {
            if (doc.length > 0) {
                const filename = "d" + req.params.yyyy + "_" + req.params.mm + "_" + req.params.dd + "_" + req.params.type + "_" + req.params.uniquestudyid + ".csv";
                var datastring = helper.doc2datastring(doc);
                res.attachment(filename);
                res.status(200).send(datastring);
            } else {
                res.status(200).end(); // empty page (use flash?) 
            }
        })

});

module.exports = router;