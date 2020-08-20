const express = require('express');
const router = express.Router();
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
            res.status(500).send(err);
        }
    });
});

router.get('/d1', function (req, res) {
    // Download the most recent document (regardless of task)
    DataLibrary.findOne({}, {}, { sort: { time: -1 } }).lean()
        .then(doc => {
            if (doc === null) {
                res.status(200).send("No documents to download.");
            } else {
                const filename = doc.type + "_" + doc.uniquestudyid + "_" + doc.subject + '.csv';
                var datastring = helper.json2csv(doc.data);
                res.attachment(filename);
                res.status(200).send(datastring);
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        });

});

router.get('/:type/:uniquestudyid/:dn', function (req, res, next) {
    // route is only d (without n), all documents will be downloaded
    const n = Number(req.params.dn.slice(1));  // no. of docs requested
    // Download most recent n document(s) for a given task
    if (req.params.dn.slice(0, 6) == 'delete') {
        next();  // next route (delete route)
    } else {
        DataLibrary.find({ uniquestudyid: req.params.uniquestudyid }, { data: 1, _id: 0 },
            { sort: { time: -1 }, limit: n }).lean()
            .then(doc => {
                if (doc.length > 0) {
                    // console.log(doc.length)
                    const filename = req.params.dn + "_" + req.params.type + "_" + req.params.uniquestudyid + ".csv";
                    var datastring = helper.doc2datastring(doc);
                    res.attachment(filename);
                    res.status(200).send(datastring);
                } else {
                    res.status(200).end(); // empty page (use flash?) 
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).send(err);
            });
    }
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
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        });
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
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        });
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
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        });

});

router.get('/:type/:uniquestudyid/dsub/:subject', function (req, res) {
    // Filter and download documents by subject for a given task
    DataLibrary.find(
        {
            uniquestudyid: req.params.uniquestudyid,
            subject: req.params.subject
        },
        {},
        { sort: { time: -1 } }).lean()
        .then(doc => {
            if (doc.length > 0) {
                const filename = "d" + req.params.subject + "_" + req.params.type + "_" + req.params.uniquestudyid + ".csv";
                var datastring = helper.doc2datastring(doc);
                res.attachment(filename);
                res.status(200).send(datastring);
            } else {
                res.status(200).end();
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        });
});

module.exports = router;