const express = require("express");
const router = express.Router();
const DataLibrary = require("../models/datalibrary");
const iso_countries = require("i18n-iso-countries");
const d3 = require("d3-array");
const helper = require('../routes/helpers/helpers');

function pick(obj, keys) {
    return keys.map(k => k in obj ? { [k]: obj[k] } : {})
        .reduce((res, o) => Object.assign(res, o), {});
}

router.get("/tasks/delaydiscount/viz", function (req, res) {

    // using d3-array
    // https://observablehq.com/@d3/d3-group
    athletes = [
        { name: "Floyd Mayweather", sport: "Boxing", nation: "United States", earnings: 285 },
        { name: "Lionel Messi", sport: "Soccer", nation: "Argentina", earnings: 111 },
        { name: "Cristiano Ronaldo", sport: "Soccer", nation: "Portugal", earnings: 108 },
        { name: "Conor McGregor", sport: "MMA", nation: "Ireland", earnings: 99 },
        { name: "Neymar", sport: "Soccer", nation: "Brazil", earnings: 90 },
        { name: "LeBron James", sport: "Basketball", nation: "United States", earnings: 85.5 },
        { name: "Roger Federer", sport: "Tennis", nation: "Switzerland", earnings: 77.2 },
        { name: "Stephen Curry", sport: "Basketball", nation: "United States", earnings: 76.9 },
        { name: "Matt Ryan", sport: "Football", nation: "United States", earnings: 67.3 },
        { name: "Matthew Stafford", sport: "Football", nation: "United States", earnings: 59.5 }
    ];

    athletes_grouped = d3.group(athletes, d => d.sport)
    // console.log(athletes_grouped);
    // console.log("only basketball objects");
    // console.log(athletes_grouped.get("Basketball"));

    // console.log("rollups: apply function by group");
    summed_earnings_by_sport = d3.rollup(athletes,
        // v => d3.sum(v, d => d.earnings),
        function (v) {
            return {
                x: v.length,
                y: d3.sum(v, d => d.earnings),
                z: d3.min(v, d => d.name)
            }
        },
        by => by.sport)
    console.log(summed_earnings_by_sport);
    // console.log(summed_earnings_by_sport.get('Boxing'))
    // console.log(summed_earnings_by_sport);

    // https://github.com/d3/d3-array#group
    obj = Array.from(summed_earnings_by_sport, ([sport, x]) => ({ sport, x }))
    // console.log(obj)

    DataLibrary.find({ uniquestudyid: 'delaydiscount' }).lean()
        .then(data => {
            // columns/keys to select
            const keys2select = ['subject', 'uniquesubjectid', 'event', 'cost', 'large_reward', 'small_reward', 'n_trial', 'n_trial_overall', 'indifference', 'auc', 'country', 'country_code']
            const n_trial_max = 5; // final indifference per cost

            // map/loop through each document to get relevant data
            var data_array = [];
            data.map(function (i) {
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

            // prepare data for chloropleth auc
            // each subject has 5 auc values (repeated) because we have 5 trials per subject, but that's fine for t
            country_data = d3.rollups(data_array, // compute median for each country
                function (v) {
                    return {
                        median_auc: d3.median(v, d => d.auc),
                        country_name: d3.min(v, d => d.country)
                        // country_id: d3.min(v, d => d.ountry_id)
                    }
                },
                // v => d3.median(v, d => d.auc),
                d => d.country_id);
            console.log(country_data)
            country_data = Array.from(country_data, function (i) {
                return { country_id: i[0], country_name: i[1].country_name, median_auc: i[1].median_auc }
            })
            console.log(country_data);

            // console.log(summed_earnings_by_sport);
            // console.log(obj.flat(1))

            // render
            // TODO: clean up code to avoid passing the entire data object to client! data_array is the trimmed/cleaned data and should have all we need?
            res.render('viz/delaydiscount.ejs', { data: data, data_array: data_array, country_array: country_data }); // render {uniquestudyid}.ejs in views directory
        })
});

module.exports = router;