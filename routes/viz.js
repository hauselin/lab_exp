const express = require("express");
const router = express.Router();
const DataLibrary = require("../models/datalibrary");
const d3 = require("d3-array");
const helper = require('../routes/helpers/helpers');

router.get("/tasks/delaydiscount/viz", function (req, res) {
    DataLibrary.find({ uniquestudyid: 'delaydiscount' }, {}, { sort: { time: -1 }, limit: 1000}).lean().then(data => {

        const keys2select = ['subject', 'uniquesubjectid', 'event', 'cost', 'large_reward', 'small_reward', 'n_trial', 'n_trial_overall', 'indifference', 'indifference_ratio', 'auc', 'country', 'country_code', 'time'];  
        const n_trial_max = 5; // final indifference per cost (depends on task parameters)

        var data_array = [];
        data.map(function (i) {  // loop through each document to select rows/cols
            const temp_data = i.data; // .data is jspsych's json data
            var data_subset = temp_data.filter(s => s.n_trial == n_trial_max && s.event == "choice"); // filter rows
            var data_subset = data_subset.map(s => helper.pick(s, keys2select));  // pick columns
            data_array.push(data_subset);
        });
        data_array = data_array.flat(1);  // flatten objects in array

        // average values per country (for choropleth)
        country_array = d3.rollups(data_array, 
            function (v) {
                return {
                    median_auc: d3.median(v, d => d.auc),  // median auc
                    country_name: d3.min(v, d => d.country)  // unique country name
                }
            },
            // v => d3.median(v, d => d.auc),
            d => d.country_code);  // by country code
        // console.log(country_array);  // nested data
        country_array = Array.from(country_array, function (i) {  // unnest data
            return { country_code: i[0], country_name: i[1].country_name, median_auc: i[1].median_auc}
        })

        res.render('viz/delaydiscount.ejs', { data_array: data_array, country_array: country_array, parent_path: helper.getParentPath(req)});
    }).catch(err => {
        console.log(err);
        res.status(500).send(err);
    });
});

router.get("/tasks/stroop/viz", function (req, res) {
    DataLibrary.find({ uniquestudyid: 'stroop' }, {}, { sort: { time: -1 } }).lean().then(data => {
        var data_array = [];
        data.map(function (i) {  // map/loop through each document to get relevant data
            var temp_data = i.datasummary; // get datasummary
            console.log(temp_data);
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
        country_array = d3.rollups(temp_data,
            function (v) {
                return {
                    rt_interference: d3.median(v, d => d.value),  // median rt interference
                    country_name: d3.min(v, d => d.country_name)  // get country name
                }
            },
            d => d.country_id);  // by country id
        // console.log(country_array);  // nested data
        country_array = Array.from(country_array, function (i) {  // unnest data
            return { country_id: i[0], country_name: i[1].country_name, rt_interference: i[1].rt_interference }
        })
        // console.log(country_array)

        res.render('viz/stroop.ejs', { data_array: data_array, country_array: country_array });
    }).catch(err => {
        console.log(err);
        res.status(500).send(err);
    });
})

router.get("/surveys/gritshort/viz", function (req, res) {
    DataLibrary.find({ uniquestudyid: 'gritshort' }, {}, { sort: { time: -1 } }).lean().then(data => {

        // var data_array2 = [];
        // var data_array = [];
        // data.map(function (i) {
        //     var temp_data = i.datasummary;
        //     temp_data.forEach(function (s) {
        //         s.country_id = Number(iso_countries.alpha2ToNumeric(s.country_code))
        //     })
        //     data_array.push(temp_data);

        //     var temp_data2 = i.data;
        //     temp_data2 = temp_data2.filter(x => x.trial_type == 'html-slider-response')
        //     // console.log(temp_data2);
        //     subject_map = d3.rollups(temp_data2,
        //         function (v) {
        //             return {
        //                 subject: d3.min(v, d => d.subject),
        //                 time: d3.min(v, d => d.time),
        //                 value: d3.mean(v, d => d.resp_reverse),
        //                 country_name: d3.min(v, d => d.country),
        //                 country_code: d3.min(v, d => d.country_code),
        //                 country_id: d3.min(v, d => Number(iso_countries.alpha2ToNumeric(d.country_code)))
        //             }
        //         },
        //         d => d.subscale);
        //     all_subscales = [
        //         'all',
        //         {
        //             subject: subject_map[0][1].subject,
        //             time: subject_map[0][1].time,
        //             value: (subject_map[0][1].value + subject_map[1][1].value) / 2,
        //             country_name: subject_map[0][1].country_name,
        //             country_code: subject_map[0][1].country_code,
        //             country_id: subject_map[0][1].country_id
        //         }
        //     ];
        //     subject_map.push(all_subscales);
        //     data_array2.push(subject_map);
        // });
        // data_array = data_array.flat(1);
        // data_array2 = data_array2.flat(1);

        // data_array2 = Array.from(data_array2, function (i) {
        //     return { type: i[0], subject: i[1].subject, value: i[1].value, time: i[1].time, country_name: i[1].country_name, country_code: i[1].country_code, country_id: i[1].country_id, }
        // })

        // var temp_data = data_array.filter(x => x.type == "all");
        // // console.log(temp_data)
        // country_array = d3.rollups(temp_data,
        //     function (v) {
        //         return {
        //             mean_resp: d3.mean(v, d => d.value),
        //             country_name: d3.min(v, d => d.country_name)
        //         }
        //     },
        //     d => d.country_id);
        // // console.log(country_array);
        // country_array = Array.from(country_array, function (i) {
        //     return { country_id: i[0], country_name: i[1].country_name, mean_resp: i[1].mean_resp }
        // })
        // // console.log(country_array);

        // render
        // res.render('viz/gritshort.ejs', { data_array: data_array2, country_array: country_array });
       res.render('viz/gritshort.ejs', { data_array: [], country_array: [] });
    }).catch(err => {
        console.log(err);
        res.status(500).send(err);
    });
});

module.exports = router;