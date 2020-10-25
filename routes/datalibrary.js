const express = require("express");
const router = express.Router();
const DataLibrary = require("../models/datalibrary")
const geoip = require('geoip-lite');

router.post('/submit-data', function (req, res) {
    const rawdata = req.body;  // data from jspsych
    const info = rawdata[0].info_; // get info_ from object/trial 0
    const datasummary = rawdata[0].datasummary;  // get datasummary_ from object/trial 0
    const ua = req.useragent; // get client/user info using express-useragent package

    // get ip
    // https://stackoverflow.com/questions/8107856/how-to-determine-a-users-ip-address-in-node
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);
    // var ip = "2001:569:7530:8100:719d:bd86:de7a:797b"

    var geoinfo = geoip.lookup(ip)
    if (!geoinfo) {
        var geoinfo = {
            range: [null, null],
            country: null,
            region: null,
            eu: null,
            timezone: null,
            city: null,
            ll: [null, null],
            metro: null,
            area: null
        }
    }

    // add columns/properties to each row/trial/object in jspsych data (eventually 2D tables/csv)
    rawdata.forEach(function (i) {
        delete i.info_; // delete to save space
        delete i.datasummary; // delete to save space

        // task info
        i.type = info.type;
        i.uniquestudyid = info.uniquestudyid;
        i.desc = info.desc;
        i.condition = info.condition;
        i.redirect_url = info.redirect_url;
        i.previous_uniquestudyid = info.previous_uniquestudyid;
        i.previous_time = info.previous_time;
        i.previous_mins_before = info.previous_mins_before;
        i.previous_task_completed = info.previous_task_completed;

        // geo/time info
        i.utc_datetime = info.utc_datetime,
        i.country = info.demographics.country,
        i.country_code = info.demographics.country_code,
        i.time = info.time,

        // client info
        i.browser = ua.browser;
        i.browser_ver = ua.version;
        i.os = ua.os;
        i.platform = ua.platform;
        i.ip = ip;

        // demographics
        i.nationality = info.demographics.country_associate;
        i.nationality_code = info.demographics.country_associate_code;
        i.language = info.demographics.language;
        i.language_code = info.demographics.language_code;
        i.religion = info.demographics.religion;
        i.race_ethnicity = info.demographics.race_ethnicity;
        i.gender = info.demographics.gender;
        i.handedness = info.demographics.handedness;
    })

    // add fields to this document
    DataLibrary.create({
        data: rawdata,  // jspsych data
        info_: info,
        geoinfo: {
            country_ip: geoinfo.country,
            region_ip: geoinfo.region,
            city_ip: geoinfo.city,
            latitude: geoinfo.ll[0],
            longitude: geoinfo.ll[1],
            timezone: geoinfo.timezone,
        },
        datasummary: datasummary,
        subject: info.subject,
        type: info.type,
        uniquestudyid: info.uniquestudyid,
        desc: info.desc,
        condition: info.condition,
        previous_uniquestudyid: info.previous_uniquestudyid,
        previous_time: info.previous_time,
        previous_mins_before: info.previous_mins_before,
        browser: ua.browser,
        browser_ver: ua.version,
        os: ua.os,
        platform: ua.platform,
        time: info.time,
        utc_datetime: info.utc_datetime,
        utc_date: info.utc_date,
        utc_time: info.utc_time,
        user_date: info.user_date,
        user_time: info.user_time
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