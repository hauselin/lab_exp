const express = require("express");
const router = express.Router();
const DataLibrary = require("../models/datalibrary")

router.post('/submit-data', function (req, res) {
    const rawdata = req.body;  // data from jspsych
    const info = rawdata[0].info_; // get info_ from object/trial 0
    const datasummary = rawdata[0].datasummary;  // get datasummary_ from object/trial 0

    // get ip
    // https://stackoverflow.com/questions/8107856/how-to-determine-a-users-ip-address-in-node
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);

    // add columns/properties to each row/trial/object in data
    rawdata.forEach(function (i) {
        i.time = info.time;
        i.utc_datetime = info.utc_datetime;
        i.browser_info = info.browser_info;
        i.ip = ip;
        i.country = null;
        i.region = null;
        i.country_code = info.country_code;
        i.latitude = null;
        i.longitude = null;
        i.type = info.type;
        i.uniquestudyid = info.uniquestudyid;
        i.desc = info.desc;
        i.condition = info.condition;
        i.redirect_url = info.redirect_url;
        i.previous_uniquestudyid = info.previous_uniquestudyid;
        i.previous_time = info.previous_time;
        i.previous_mins_before = info.previous_mins_before;
        delete i.info_; // delete to save space
        delete i.datasummary; // delete to save space
    })

    DataLibrary.create({
        subject: info.subject, // body is the json data from jspsych
        local_subject: info.local_subject,
        type: info.type,
        uniquestudyid: info.uniquestudyid,
        desc: info.desc,
        condition: info.condition,
        previous_uniquestudyid: info.previous_uniquestudyid,
        previous_time: info.previous_time,
        previous_mins_before: info.previous_mins_before,
        info_: info,
        datasummary: datasummary,
        browser: info.browser,
        time: info.time,
        utc_datetime: info.utc_datetime,
        utc_date: info.utc_date,
        utc_time: info.utc_time,
        user_date: info.user_date,
        user_time: info.user_time,
        data: rawdata
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