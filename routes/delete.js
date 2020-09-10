var express = require('express');
var router = express.Router();
var msg = "";
const helper = require('../routes/helpers/helpers');
const DataLibrary = require("../models/datalibrary");


router.get('/delete1', helper.isLoggedIn, function (req, res) {
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
            var c = req.originalUrl.split('/').length - 1;
            var c = "../".repeat(c);
            const c1 = c + "public/assets/css/loaders/loader-typing.css";
            const c2 = c + "public/assets/css/theme.css";                
            res.status(200).render(msg, { c1: c1, c2: c2 });
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        });
});


router.get('/:type/:uniquestudyid/:deleten', helper.isLoggedIn, function (req, res) {
    // Delete most recent n document(s) for a given task
    // if route is only delete (without n), all documents will be deleted
    const n = Number(req.params.dn.slice(6));  // no. of docs requested
    if (isNaN(n)) {
        next(); // next route
    } else {
        DataLibrary.find({ uniquestudyid: req.params.uniquestudyid }, {},
            { sort: { time: -1 }, limit: Number(req.params.deleten.slice(6)) })
            .then(doc => {
                if (doc.length == 0) {
                    msg = "errorDelete";
                } else {
                    helper.deleteData(DataLibrary, doc);
                    msg = "successDelete";
                }
                var c = req.originalUrl.split('/').length - 1;
                var c = "../".repeat(c);
                const c1 = c + "public/assets/css/loaders/loader-typing.css";
                const c2 = c + "public/assets/css/theme.css";                
                res.status(200).render(msg, { c1: c1, c2: c2 });
            })
            .catch(err => {
                console.log(err);
                res.status(500).send(err);
            });
    }
});


router.get('/:type/:uniquestudyid/delete/:yyyy', helper.isLoggedIn, function (req, res) {
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
            var c = req.originalUrl.split('/').length - 1;
            var c = "../".repeat(c);
            const c1 = c + "public/assets/css/loaders/loader-typing.css";
            const c2 = c + "public/assets/css/theme.css";                
            res.status(200).render(msg, { c1: c1, c2: c2 });
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        });
});


router.get('/:type/:uniquestudyid/delete/:yyyy/:mm', helper.isLoggedIn, function (req, res) {
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
            var c = req.originalUrl.split('/').length - 1;
            var c = "../".repeat(c);
            const c1 = c + "public/assets/css/loaders/loader-typing.css";
            const c2 = c + "public/assets/css/theme.css";                
            res.status(200).render(msg, { c1: c1, c2: c2 });
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        });
});


router.get('/:type/:uniquestudyid/delete/:yyyy/:mm/:dd', helper.isLoggedIn, function (req, res) {
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
            var c = req.originalUrl.split('/').length - 1;
            var c = "../".repeat(c);
            const c1 = c + "public/assets/css/loaders/loader-typing.css";
            const c2 = c + "public/assets/css/theme.css";                
            res.status(200).render(msg, { c1: c1, c2: c2 });
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        });
});


router.get('/:type/:uniquestudyid/deletesub/:subject', helper.isLoggedIn, function (req, res) {
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
            var c = req.originalUrl.split('/').length - 1;
            var c = "../".repeat(c);
            const c1 = c + "public/assets/css/loaders/loader-typing.css";
            const c2 = c + "public/assets/css/theme.css";                
            res.status(200).render(msg, { c1: c1, c2: c2 });
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        });
});


module.exports = router;