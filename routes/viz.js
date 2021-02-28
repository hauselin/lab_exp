const express = require("express");
const router = express.Router();
const DataLibrary = require("../models/datalibrary");
const d3 = require("d3-array");
const helper = require('../routes/helpers/helpers');
const jStat = require('jstat');

router.get("/tasks/delaydiscount/viz", function (req, res) {
    DataLibrary.find({ uniquestudyid: 'delaydiscount' }, {}, { sort: { time: -1 }, limit: 1000 }).lean().then(data => {

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
        data_array = helper.matchData(req, data_array);

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
            return { country_code: i[0], country_name: i[1].country_name, median_auc: i[1].median_auc }
        })

        res.render('viz/delaydiscount.ejs', { data_array: data_array, country_array: country_array, parent_path: helper.getParentPath(req) });
    }).catch(err => {
        console.log(err);
        res.status(500).send(err);
    });
});

router.get("/tasks/stroop/viz", function (req, res) {
    DataLibrary.find({ uniquestudyid: 'stroop' }, {}, { sort: { time: -1 }, limit: 1000 }).lean().then(data => {
        var data_array = [];
        data.map(function (i) {  // map/loop through each document to get relevant data
            var temp_data = i.datasummary; // get datasummary
            data_array.push(temp_data);
        });
        data_array = data_array.flat(1);  // flatten objects in array
        data_array = helper.matchData(req, data_array);

        // prepare data for chloropleth
        // compute median rt interference for each country
        var choropleth_data = data_array.filter(x => x.type == "interference" && x.param == "rt");
        // console.log(choropleth_data)
        country_array = d3.rollups(choropleth_data,
            function (v) {
                return {
                    rt_interference: d3.median(v, d => d.value),  // median rt interference
                    country: d3.min(v, d => d.country)  // get country name
                }
            },
            d => d.country_code);  // group by country_code
        // console.log(country_array);  // nested data
        country_array = Array.from(country_array, function (i) {  // unnest data
            return { country_code: i[0], country: i[1].country, rt_interference: i[1].rt_interference }
        })

        res.render('viz/stroop.ejs', { data_array: data_array, country_array: country_array, parent_path: helper.getParentPath(req) });
    }).catch(err => {
        console.log(err);
        res.status(500).send(err);
    });
})

router.get("/tasks/flanker/viz", function (req, res) {
    DataLibrary.find({ uniquestudyid: 'flanker' }, {}, { sort: { time: -1 }, limit: 1000 }).lean().then(data => {
        var data_array = [];
        data.map(function (i) {  // map/loop through each document to get relevant data
            var temp_data = i.datasummary; // get datasummary
            data_array.push(temp_data);
        });
        console.log(data_array)
        data_array = data_array.flat(1);  // flatten objects in array
        data_array = helper.matchData(req, data_array);

        // prepare data for chloropleth
        // compute median rt interference for each country
        var choropleth_data = data_array.filter(x => x.type == "interference" && x.param == "rt");
        // console.log(choropleth_data)
        country_array = d3.rollups(choropleth_data,
            function (v) {
                return {
                    rt_interference: d3.median(v, d => d.value),  // median rt interference
                    country: d3.min(v, d => d.country)  // get country name
                }
            },
            d => d.country_code);  // group by country_code
        // console.log(country_array);  // nested data
        country_array = Array.from(country_array, function (i) {  // unnest data
            return { country_code: i[0], country: i[1].country, rt_interference: i[1].rt_interference }
        })

        res.render('viz/flanker.ejs', { data_array: data_array, country_array: country_array, parent_path: helper.getParentPath(req) });
    }).catch(err => {
        console.log(err);
        res.status(500).send(err);
    });
})

router.get("/tasks/updatemath/viz", function (req, res) {
    DataLibrary.find({ uniquestudyid: 'updatemath' }, {}, { sort: { time: -1 }, limit: 1000 }).lean().then(data => {
        var data_array = [];
        data.map(function (i) {  // map/loop through each document to get relevant data
            var temp_data = i.datasummary; // get datasummary
            data_array.push(temp_data);
        });
        // console.log(data_array)
        data_array = data_array.flat(1);  // flatten objects in array
        data_array = helper.matchData(req, data_array);

        // prepare data for chloropleth
        // compute median rt interference for each country
        var choropleth_data = data_array.filter(x => x.param == "rt");
        // console.log(choropleth_data)
        country_array = d3.rollups(choropleth_data,
            function (v) {
                return {
                    rt: d3.median(v, d => d.value),  // median rt interference
                    country: d3.min(v, d => d.country)  // get country name
                }
            },
            d => d.country_code);  // group by country_code
        console.log(country_array);  // nested data
        country_array = Array.from(country_array, function (i) {  // unnest data
            return { country_code: i[0], country: i[1].country, rt: i[1].rt }
        })

        res.render('viz/updatemath.ejs', { data_array: data_array, country_array: country_array, parent_path: helper.getParentPath(req) });
    }).catch(err => {
        console.log(err);
        res.status(500).send(err);
    });
})

router.get("/tasks/symbolcount/viz", function (req, res) {
    DataLibrary.find({ uniquestudyid: 'symbolcount' }, {}, { sort: { time: -1 }, limit: 1000 }).lean().then(data => {
        var data_array = [];
        data.map(function (i) {  // map/loop through each document to get relevant data
            var temp_data = i.datasummary; // get datasummary
            data_array.push(temp_data);
        });
        console.log(data_array)
        data_array = data_array.flat(1);  // flatten objects in array
        data_array = helper.matchData(req, data_array);

        // prepare data for chloropleth
        // compute median rt interference for each country
        var choropleth_data = data_array.filter(x => x.param == "acc");
        // console.log(choropleth_data)
        country_array = d3.rollups(choropleth_data,
            function (v) {
                return {
                    acc: d3.median(v, d => d.value),  // median rt interference
                    country: d3.min(v, d => d.country)  // get country name
                }
            },
            d => d.country_code);  // group by country_code
        // console.log(country_array);  // nested data
        country_array = Array.from(country_array, function (i) {  // unnest data
            return { country_code: i[0], country: i[1].country, acc: i[1].acc }
        })

        res.render('viz/symbolcount.ejs', { data_array: data_array, country_array: country_array, parent_path: helper.getParentPath(req) });
    }).catch(err => {
        console.log(err);
        res.status(500).send(err);
    });
})

router.get("/surveys/gritshort/viz", function (req, res) {
    DataLibrary.find({ uniquestudyid: 'gritshort' }, {}, { sort: { time: -1 }, limit: 1000 }).lean().then(data => {
        var data_array = [];
        data.map(function (i) {
            data_array.push(i.datasummary);
        });
        data_array = data_array.flat(1);  // flatten objects in array
        data_array = helper.matchData(req, data_array);

        country_array = d3.rollups(data_array,
            function (v) {
                return {
                    value: d3.median(v, d => d.value),
                    country: d3.min(v, d => d.country)
                }
            },
            d => d.country_code);
        country_array = Array.from(country_array, function (i) {  // unnest data
            return { country_code: i[0], country: i[1].country, value: i[1].value }
        });

        res.render('viz/gritshort.ejs', { data_array: data_array, country_array: country_array, parent_path: helper.getParentPath(req) });
    }).catch(err => {
        console.log(err);
        res.status(500).send(err);
    });
});

router.get("/surveys/brs1/viz", function (req, res) {
    DataLibrary.find({ uniquestudyid: 'brs1' }, {}, { sort: { time: -1 }, limit: 1000 }).lean().then(data => {
        var data_array = [];
        data.map(function (i) {
            data_array.push(i.datasummary);
        });
        data_array = data_array.flat(1);  // flatten objects in array
        data_array = helper.matchData(req, data_array);

        country_array = d3.rollups(data_array,
            function (v) {
                return {
                    value: d3.median(v, d => d.value),
                    country: d3.min(v, d => d.country)
                }
            },
            d => d.country_code);
        country_array = Array.from(country_array, function (i) {  // unnest data
            return { country_code: i[0], country: i[1].country, value: i[1].value }
        });

        res.render('viz/brs1.ejs', { data_array: data_array, country_array: country_array, parent_path: helper.getParentPath(req) });
    }).catch(err => {
        console.log(err);
        res.status(500).send(err);
    });
});


router.get("/surveys/bigfiveaspect/viz", function (req, res) {
    DataLibrary.find({ uniquestudyid: 'bigfiveaspect' }, {}, { sort: { time: -1 }, limit: 1000 }).lean().then(data => {
        var data_array = [];
        const corr_matrix = {
            'neuroticism': [],
            'agreeableness': [],
            'conscientiousness': [],
            'extraversion': [],
            'openness': [],
        };
        data.map(function (i) {
            data_array.push(i.datasummary);
            temp_data = i.datasummary.filter(i => i.param == 'subscale2');
            for (i = 0; i < temp_data.length; i++) {
                corr_matrix[temp_data[i].subscale].push(temp_data[i].value);
            }
        });
        data_array = data_array.flat(1);  // flatten objects in array
        data_array = helper.matchData(req, data_array);

        choropleth_filters = Object.keys(corr_matrix);
        choropleth_filters.push('variance');
        random_filter = choropleth_filters[Math.floor(Math.random() * choropleth_filters.length)];
        choropleth_array = data_array.filter(i => i.subscale == random_filter)

        country_array = d3.rollups(choropleth_array,
            function (v) {
                return {
                    value: d3.median(v, d => d.value),
                    country: d3.min(v, d => d.country)
                }
            },
            d => d.country_code);
        country_array = Array.from(country_array, function (i) {  // unnest data
            return { country_code: i[0], country: i[1].country, value: i[1].value, subscale: random_filter }
        });

        var matrix_array = [];
        for (i = 0; i < Object.keys(corr_matrix).length; i++) {
            for (j = 0; j < Object.keys(corr_matrix).length; j++) {
                matrix_array.push(
                    {
                        x: Object.keys(corr_matrix)[i],
                        y: Object.keys(corr_matrix)[j],
                        value: jStat.corrcoeff(Object.values(corr_matrix)[i], Object.values(corr_matrix)[j]),
                    }
                )
            }
        }

        res.render('viz/bigfiveaspect.ejs', { data_array: data_array, matrix_array: matrix_array, country_array: country_array, parent_path: helper.getParentPath(req) });
    }).catch(err => {
        console.log(err);
        res.status(500).send(err);
    });
});

// render comingSoon.ejs for all routes that don't yet have a viz
router.get("/:type/:uniquestudyid/viz", function (req, res) {
    helper.cssFix(req, res, "comingSoon", 200);
})

module.exports = router;