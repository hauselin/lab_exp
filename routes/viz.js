const express = require("express");
const router = express.Router();
const DataLibrary = require("../models/datalibrary");
const iso_countries = require("i18n-iso-countries");
const d3 = require("d3-array");
const helper = require('../routes/helpers/helpers');

router.get("/tasks/delaydiscount/viz", function (req, res) {
    DataLibrary.find({ uniquestudyid: 'delaydiscount' }, {}, { sort: { time: -1 } }).lean().then(data => {
        const keys2select = ['subject', 'uniquesubjectid', 'event', 'cost', 'large_reward', 'small_reward', 'n_trial', 'n_trial_overall', 'indifference', 'auc', 'country', 'country_code', 'longitude', 'latitude', 'time'];  // columns/keys to select
        const n_trial_max = 5; // final indifference per cost (depends on task parameters)

        var data_array = [];
        data.map(function (i) {  // map/loop through each document to get relevant data
            const temp_data = i.data; // get jspsych data
            var data_subset = temp_data.filter(s => s.n_trial == n_trial_max && s.event == "choice");  // select relevant rows
            var data_subset = data_subset.map(s => helper.pick(s, keys2select));  // select relevant columns
            data_subset.forEach(function (s) { // for each row in this document
                s.indifference_ratio = s.indifference / s.large_reward;  // rescale indifference
                s.country_id = Number(iso_countries.alpha2ToNumeric(s.country_code))  // get country code
            })
            data_array.push(data_subset);
        });
        data_array = data_array.flat(1);  // flatten objects in array

        // prepare data for chloropleth auc (each subject has 5 auc values (repeated) because we have 5 trials per subject, but that's fine)
        country_data = d3.rollups(data_array, // compute median for each country
            function (v) {
                return {
                    median_auc: d3.median(v, d => d.auc),  // median auc
                    country_name: d3.min(v, d => d.country)  // get country name
                }
            },
            // v => d3.median(v, d => d.auc),
            d => d.country_id);  // by country id
        // console.log(country_data);  // nested data
        country_data = Array.from(country_data, function (i) {  // unnest data
            return { country_id: i[0], country_name: i[1].country_name, median_auc: i[1].median_auc }
        })

        res.render('viz/delaydiscount.ejs', { data_array: data_array, country_array: country_data });
    }).catch(err => {
        console.log(err);
        res.status(500).send(err);
    });
});

router.get("/tasks/stroop/viz", function (req, res) {
    DataLibrary.find({ uniquestudyid: 'stroop' }, {}, { sort: { time: -1 } }).lean().then(data => {
        var data_array = [];
        data.map(function (i) {  // map/loop through each document to get relevant data
            var temp_data = i.datasummary_; // get datasummary_
            // convert country code to country id
            temp_data.forEach(function (s) {
                s.country_id = Number(iso_countries.alpha2ToNumeric(s.country_code))
            })
            data_array.push(temp_data);
        });
        data_array = data_array.flat(1);  // flatten objects in array
        // console.log(data_array)

        // prepare data for chloropleth
        // compute median rt interference for each country
        var temp_data = data_array.filter(x => x.type == "interference" && x.param == "rt");
        // console.log(temp_data)
        country_data = d3.rollups(temp_data,
            function (v) {
                return {
                    rt_interference: d3.median(v, d => d.value),  // median rt interference
                    country_name: d3.min(v, d => d.country_name)  // get country name
                }
            },
            d => d.country_id);  // by country id
        // console.log(country_data);  // nested data
        country_data = Array.from(country_data, function (i) {  // unnest data
            return { country_id: i[0], country_name: i[1].country_name, rt_interference: i[1].rt_interference }
        })

        res.render('viz/stroop.ejs', { data_array: data_array, country_array: country_data });            
    }).catch(err => {
        console.log(err);
        res.status(500).send(err);
    });
})

router.get("/surveys/gritshort/viz", function (req, res) {
    DataLibrary.find({ uniquestudyid: 'gritshort' }, {}, { sort: { time: -1 } }).lean().then(data => {
        const keys2select = ['subject', 'uniquesubjectid', 'trial_type', 'subscale', 'resp_reverse', 'country', 'country_code', 'longitude', 'latitude', 'time'];  // columns/keys to select

        var data_array = [];
        var subject_array = [];
        data.map(function (i) {  // map/loop through each document to get relevant data
            const temp_data = i.data; // get jspsych data
            var data_subset = temp_data.filter(s => s.trial_type != 'external-html');  // select relevant rows
            var data_subset = data_subset.map(s => helper.pick(s, keys2select));  // select relevant columns
            data_subset.forEach(function (s) { // for each row in this document
                s.country_id = Number(iso_countries.alpha2ToNumeric(s.country_code))  // get country code
            })
            data_by_subscale = d3.rollup(data_subset, function (v) {
                return {
                    mean_resp: d3.mean(v, d => d.resp_reverse),  // mean response
                    subject: d3.min(v, d => d.subject),  // get subject ID
                    time: d3.min(v, d => d.time)  // get start time
                }
            }, d => d.subscale)
            subscale_array = Array.from(data_by_subscale, function (i) {  // unnest data
                return { subscale: i[0], resp_reverse: i[1].mean_resp, subject: i[1].subject, time: i[1].time }
            })
            subject_array.push(subscale_array);
            data_array.push(data_subset);
        });
        data_array = data_array.flat(1);  // flatten objects in array
        subject_array = subject_array.flat(1);  // flatten objects in array
        // console.log(data_array);
        // console.log(data_array.length);
        console.log(subject_array);
        console.log(subject_array.length);

        // prepare data for chloropleth
        country_data = d3.rollups(data_array, // compute median for each country
            function (v) {
                return {
                    mean_resp: d3.mean(v, d => d.resp_reverse),  // mean response
                    country_name: d3.min(v, d => d.country)  // get country name
                }
            },
            d => d.country_id);  // by country id
        // console.log(country_data);  // nested data
        country_data = Array.from(country_data, function (i) {  // unnest data
            return { country_id: i[0], country_name: i[1].country_name, mean_resp: i[1].mean_resp }
        })
        // console.log(country_data);

        // render
        res.render('viz/gritshort.ejs', { data_array: data_array, subject_array: subject_array, country_array: country_data });
    }).catch(err => {
        console.log(err);
        res.status(500).send(err);
    });
});

module.exports = router;