var express = require("express");
var router = express.Router();
var DataLibrary = require("../models/datalibrary");
var countries = require("i18n-iso-countries");

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

router.get("/:type/:uniquestudyid/viz", function (req, res) {
    Promise.all([
        DataLibrary.find({ uniquestudyid: req.params.uniquestudyid }).lean(),
    ])
        .then(([data]) => {
            console.log(data);
            data_array = [];
            country_trials = [];
            for (i = 0; i < data.length; i++) {
                data_array.push.apply(data_array, data[i].data);
                country_id = Number(countries.alpha2ToNumeric(data[i].info_.country_code));
                trial_auc = data[i].data[0].auc;
                country_trials.push({ country_id: country_id, country_name: data[i].info_.country_name, trial_auc: [trial_auc] })
            }
            var country_array = country_trials.reduce(merge_country, {store: {}, list: []}).list;
            for (i = 0; i < country_array.length; i++) {
                country_array[i].median_auc = median(country_array[i].trial_auc);
            }

            // TODO Frank: now that we know which figures we want to plot, we know what variables we want to pass to the client, so we might want to do all the processing/filtering here instead? this way, we don't end up passing lots of identifying information too....

            const file = 'viz/' + req.params.uniquestudyid + '.ejs';
            res.render(file, { data: data, data_array: data_array, country_array: country_array }); // render {uniquestudyid}.ejs in views directory
        })
});

module.exports = router;