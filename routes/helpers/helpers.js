// convert json to csv
function json2csv(objArray) {
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

module.exports = { json2csv }