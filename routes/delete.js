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

router.get('/:type/:uniquestudyid/delete' + '/:n', function (req, res) {
    // Download most recent n document(s) for a given task
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

module.exports = router;