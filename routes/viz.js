const express = require("express");
const router = express.Router();
const DataLibrary = require("../models/datalibrary");
const countries = require("i18n-iso-countries");
const d3 = require("d3-array");

function merge_country(collector, type) {
    var key = (type.country_id); // identity key.
    var store = collector.store;
    var storedType = store[key];
    if (storedType) { // merge trial_auc of identically named types.
        storedType.trial_auc = storedType.trial_auc.concat(type.trial_auc);
    } else {
        store[key] = type;
        collector.list.push(type);
    }
    return collector;
}

// median function adapted from jspsych
function median(array) {
    if (array.length == 0) { return undefined };
    var numbers = array.slice(0).sort(function (a, b) { return a - b; }); // sort
    var middle = Math.floor(numbers.length / 2);
    var isEven = numbers.length % 2 === 0;
    return isEven ? (numbers[middle] + numbers[middle - 1]) / 2 : numbers[middle];
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
    console.log(athletes_grouped);
    console.log("only basketball objects");
    console.log(athletes_grouped.get("Basketball"));

    console.log("rollups: apply function by group");
    summed_earnings_by_sport = d3.rollup(athletes, v => d3.sum(v, d => d.earnings), by => by.sport);
    console.log(summed_earnings_by_sport);
    console.log(summed_earnings_by_sport.get('Boxing'))
    console.log(summed_earnings_by_sport);

    // https://github.com/d3/d3-array#group
    obj = Array.from(summed_earnings_by_sport, ([sport, earnings_summed]) => ({ sport, earnings_summed }))
    console.log(obj)

    DataLibrary.find({ uniquestudyid: 'delaydiscount' }).lean()
        .then(data => {
            data_array = [];
            country_trials = [];
            for (i = 0; i < data.length; i++) {
                data_array.push.apply(data_array, data[i].data);
                country_id = Number(countries.alpha2ToNumeric(data[i].info_.country_code));
                trial_auc = data[i].data[0].auc;
                country_trials.push({ country_id: country_id, country_name: data[i].info_.country_name, trial_auc: [trial_auc] })
            }
            var country_array = country_trials.reduce(merge_country, { store: {}, list: [] }).list;
            for (i = 0; i < country_array.length; i++) {
                country_array[i].median_auc = median(country_array[i].trial_auc);
            }

            // TODO Frank: now that we know which figures we want to plot, we know what variables we want to pass to the client, so we might want to do all the processing/filtering here instead? this way, we don't end up passing lots of identifying information too....

            res.render('viz/delaydiscount.ejs', { data: data, data_array: data_array, country_array: country_array }); // render {uniquestudyid}.ejs in views directory
        })
});

module.exports = router;