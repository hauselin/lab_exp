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

module.exports = router;