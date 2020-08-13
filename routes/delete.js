var express = require('express');
var router = express.Router();
const DataLibrary = require("../models/datalibrary");


router.get('/delete1', function (req, res) {
    // Delete the most recent document (regardless of task)
    DataLibrary.findOne({}, {}, { sort: { time: -1 } }).lean()
    .then(doc => {
        DataLibrary.deleteOne({user_time: doc.user_time}, function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Record deleted successfully.")
            }
        })
    })
});


router.get('/:type/:uniquestudyid/ddelete' + '/:n', function (req, res) {
    // Delete most recent n document(s) for a given task
    DataLibrary.find({ uniquestudyid: req.params.uniquestudyid }, {},
        { sort: { time: -1 }, limit: Number(req.params.n) }).lean()
        .then(doc => {
            for (var i = 0; i < doc.length; i++) {
                DataLibrary.deleteOne( {user_time: doc[i].user_time}, function(err) {
                    if (err) {
                        console.log(err);
                    }
                })
            }; console.log("Deleted " + req.params.n + " record(s) successfully.");
        });
});


router.get('/:type/:uniquestudyid/delete/:yyyy', function (req, res) {
    // Filter and delete documents by year for a given task
    DataLibrary.find(
        {
            uniquestudyid: req.params.uniquestudyid,
            "utc_date.year": Number(req.params.yyyy)
        },
        {},
        { sort: { time: -1 } }).lean()
        .then(doc => {
            if (doc.length == 0) {
                console.log("No documents found for the year " + req.params.yyyy + " to delete.");
            } else {
                for (var i = 0; i < doc.length; i++) {
                    DataLibrary.deleteOne( {user_time: doc[i].user_time}, function(err) {
                        if (err) {
                            console.log(err);
                        }
                    })
                }; console.log("Deleted record(s) for " + req.params.yyyy + " successfully.");
            }
        });
});


router.get('/:type/:uniquestudyid/delete/:yyyy/:mm', function (req, res) {
    // Filter and delete documents by year and month for a given task
    DataLibrary.find(
        {
            uniquestudyid: req.params.uniquestudyid,
            "utc_date.year": Number(req.params.yyyy),
            "utc_date.month": Number(req.params.mm)
        },
        {},
        { sort: { time: -1 } }).lean()
        .then(doc => {
            if (doc.length == 0) {
                console.log("No documents found to delete.");
            } else {
                for (var i = 0; i < doc.length; i++) {
                    DataLibrary.deleteOne( {user_time: doc[i].user_time}, function(err) {
                        if (err) {
                            console.log(err);
                        }
                    })
                }; console.log("Deleted record(s) for " + req.params.yyyy + "/" + req.params.mm + " successfully.");
            }
        })
});


router.get('/:type/:uniquestudyid/delete/:yyyy/:mm/:dd', function (req, res) {
    // Filter and delete documents by year, month, and day for a given task
    DataLibrary.find(
        {
            uniquestudyid: req.params.uniquestudyid,
            "utc_date.year": Number(req.params.yyyy),
            "utc_date.month": Number(req.params.mm),
            "utc_date.day": Number(req.params.dd)
        },
        {},
        { sort: { time: -1 } }).lean()
        .then(doc => {
            if (doc.length == 0) {
                console.log("No documents found to delete.");
            } else {
                for (var i = 0; i < doc.length; i++) {
                    DataLibrary.deleteOne( {user_time: doc[i].user_time}, function(err) {
                        if (err) {
                            console.log(err);
                        }
                    })
                }; console.log("Deleted record(s) for " + req.params.yyyy + "/" + req.params.mm + 
                "/" + req.params.dd + " successfully.");
            }
        })

});


module.exports = router;