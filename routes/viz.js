const express = require("express");
const router = express.Router();
const DataLibrary = require("../models/datalibrary");
const iso_countries = require("i18n-iso-countries");
const d3 = require("d3-array");
const helper = require('../routes/helpers/helpers');

router.get("/tasks/delaydiscount/viz", function (req, res) {
    DataLibrary.find({ uniquestudyid: 'delaydiscount' }).lean().then(data => {
        const keys2select = ['subject', 'uniquesubjectid', 'event', 'cost', 'large_reward', 'small_reward', 'n_trial', 'n_trial_overall', 'indifference', 'auc', 'country', 'country_code', 'longitude', 'latitude'];  // columns/keys to select
        const n_trial_max = 5; // final indifference per cost

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
        console.log(data_array);  // no. of subjects/documents * 5
        console.log(data_array.length); // no. of subjects/documents

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
        console.log(country_data);  // nested data
        country_data = Array.from(country_data, function (i) {  // unnest data
            return { country_id: i[0], country_name: i[1].country_name, median_auc: i[1].median_auc }
        })
        console.log(country_data);

        // render
        res.render('viz/delaydiscount.ejs', { data_array: data_array, country_array: country_data });
    })
});

module.exports = router;