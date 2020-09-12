var express = require('express');
var router = express.Router();
var msg = "";
const helper = require('../routes/helpers/helpers');
const DataLibrary = require("../models/datalibrary");
const middleware = require("../middleware");


router.get('/delete1', middleware.isLoggedIn, function (req, res) {
    // Delete the most recent document (regardless of task)
    DataLibrary.findOne({}, {}, { sort: { time: -1 } })
        .then(doc => {
            if (doc == null) {
                msg = "errorDelete";
            } else {
                DataLibrary.deleteOne({ _id: doc._id }, function (err) {
                    if (err) {
                        console.log(err);
                        res.status(500).send(err);
                    } else {
                        msg = "successDelete";
                    }
                })
            }
            helper.cssFix(req, res, msg);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        });
});


router.get('/:type/:uniquestudyid/delete/n/:n', middleware.isLoggedIn, function (req, res) {
    // Delete most recent n document(s) for a given task
    // if n is 0, all documents will be deleted
    DataLibrary.find({ uniquestudyid: req.params.uniquestudyid }, {},
        { sort: { time: -1 }, limit: Number(req.params.n) })
        .then(doc => {
            if (doc.length == 0) {
                msg = "errorDelete";
            } else {
                helper.deleteData(DataLibrary, doc);
                msg = "successDelete";
            }
            helper.cssFix(req, res, msg);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        });  
});


router.get('/:type/:uniquestudyid/delete/:yyyy', middleware.isLoggedIn, function (req, res) {
    // Filter and delete documents by year for a given task
    DataLibrary.find(
        {
            uniquestudyid: req.params.uniquestudyid,
            "utc_date.year": Number(req.params.yyyy)
        },
        {},
        { sort: { time: -1 } })
        .then(doc => {
            if (doc.length == 0) {
                msg = "errorDelete";
            } else {
                helper.deleteData(DataLibrary, doc);
                msg = "successDelete";
            }
            helper.cssFix(req, res, msg);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        });
});


router.get('/:type/:uniquestudyid/delete/:yyyy/:mm', middleware.isLoggedIn, function (req, res) {
    // Filter and delete documents by year and month for a given task
    DataLibrary.find(
        {
            uniquestudyid: req.params.uniquestudyid,
            "utc_date.year": Number(req.params.yyyy),
            "utc_date.month": Number(req.params.mm)
        },
        {},
        { sort: { time: -1 } })
        .then(doc => {
            if (doc.length == 0) {
                msg = "errorDelete";
            } else {
                helper.deleteData(DataLibrary, doc);
                msg = "successDelete";
            }
            helper.cssFix(req, res, msg);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        });
});


router.get('/:type/:uniquestudyid/delete/:yyyy/:mm/:dd', middleware.isLoggedIn, function (req, res) {
    // Filter and delete documents by year, month, and day for a given task
    DataLibrary.find(
        {
            uniquestudyid: req.params.uniquestudyid,
            "utc_date.year": Number(req.params.yyyy),
            "utc_date.month": Number(req.params.mm),
            "utc_date.day": Number(req.params.dd)
        },
        {},
        { sort: { time: -1 } })
        .then(doc => {
            if (doc.length == 0) {
                msg = "errorDelete";
            } else {
                helper.deleteData(DataLibrary, doc);
                msg = "successDelete";
            }
            helper.cssFix(req, res, msg);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        });
});


router.get('/:type/:uniquestudyid/deletesub/:subject', middleware.isLoggedIn, function (req, res) {
    // Filter and delete documents by subject for a given task
    DataLibrary.find(
        {
            uniquestudyid: req.params.uniquestudyid,
            subject: req.params.subject
        },
        {},
        { sort: { time: -1 } })
        .then(doc => {
            if (doc.length == 0) {
                msg = "errorDelete";
            } else {
                helper.deleteData(DataLibrary, doc);
                msg = "successDelete";
            }
            helper.cssFix(req, res, msg);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        });
});


module.exports = router;