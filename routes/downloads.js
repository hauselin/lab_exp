var express = require("express");
var router = express.Router()

// DEMO download csv file: grit_short.csv
router.get('/dl', function (req, res) {
    const file = path.join(__dirname + '/surveys/grit_short/items.csv');
    const filename = 'dl.csv';
    res.download(file, filename, function (err) {
        if (err) {
            console.log(err);
        }
    });
});

// DEMO download csv string
// https://stackoverflow.com/questions/18306013/how-to-export-csv-nodejs/39652522
router.get('/dl2', function (req, res) {
    // TODO: Maham see comment below
    // JUST A DEMO! JSON2CSV should be elsewhere (Maham, can you help move it elsewhere?) ! (jspsych's function to convert its json data to csv)
    function JSON2CSV(objArray) {
        // https://github.com/jspsych/jsPsych/blob/83980085ef604c815f0d97ab55c816219e969b84/jspsych.js#L1565
        var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
        var line = '';
        var result = '';
        var columns = [];
        var i = 0;
        for (var j = 0; j < array.length; j++) {
            for (var key in array[j]) {
                var keyString = key + "";
                keyString = '"' + keyString.replace(/"/g, '""') + '",';
                if (!columns.includes(key)) {
                    columns[i] = key;
                    line += keyString;
                    i++;
                }
            }
        }
        line = line.slice(0, -1);
        result += line + '\r\n';
        for (var i = 0; i < array.length; i++) {
            var line = '';
            for (var j = 0; j < columns.length; j++) {
                var value = (typeof array[i][columns[j]] === 'undefined') ? '' : array[i][columns[j]];
                var valueString = value + "";
                line += '"' + valueString.replace(/"/g, '""') + '",';
            }

            line = line.slice(0, -1);
            result += line + '\r\n';
        }
        return result;
    }
    // create some dummy data for testing purposes
    const csvstring = JSON2CSV([{ trial: 1, rt: 1 }, { trial: 2, rt: 2 }, { trial: 3, rt: 3, acc: 0 }]);
    console.log(csvstring); // just checking the output
    res.attachment('dl2.csv'); // filename
    // res.status(200).send('abc,cde\n11,22'); // csv string to save inside dl2.csv (this will be the CSV representation of jspsych's data)
    res.status(200).send(csvstring); // csv string to save inside dl2.csv (this will be the CSV representation of jspsych's data)
});

module.exports = router