var express = require("express");
var router = express.Router();
var DataLibrary = require("../models/datalibrary")

router.post('/submit-data', function (req, res) {
    DataLibrary.create({
        subject: req.body[0].subject, // body is the json data from jspsych
        type: req.body[0].type,
        uniquestudyid: req.body[0].uniquestudyid,
        desc: req.body[0].desc,
        condition: req.body[0].condition,
        previous: 'TODO: previous task uniquestudyid',
        previous_time: 'TODO: previous task time',
        previous_timediff: 'TODO: hours since previous task?',
        info_: req.body[0].info_,
        datasummary_: req.body[0].datasummary_,
        browser: req.body[0].browser,
        time: req.body[0].info_.time,
        utc_datetime: req.body[0].info_.utc_datetime,
        utc_date: req.body[0].info_.utc_date,
        utc_time: req.body[0].info_.utc_time,
        user_date: req.body[0].info_.user_date,
        user_time: req.body[0].info_.user_time,
        data: req.body,
    }, function (err, data) {
        if (err) { // error
            console.log(err); // print error to nodejs console
            res.sendStatus(500);  // send internal server error (500: http status code internal server error)
        } else { // success
            // console.log(data); // print req.body in nodejs console
            res.sendStatus(200); // send OK to client (200: http status code OK)
        }
    });
});

module.exports = router;