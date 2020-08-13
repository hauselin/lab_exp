// convert jspsych's json data to csv
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

// function doc2datastring(doc) {
//     var datastring = '';
//     for (var i = 0; i < doc.length; i++) {
//         if (i == 0) { // save header from csv
//             datastring += json2csv(doc[i].data);
//         } else { // if not the first document, remove header row from csv 
//             var temp_datastring = json2csv(doc[i].data);
//             datastring += temp_datastring.slice(temp_datastring.indexOf("\n"));
//         }

//     } return datastring;
// }

function doc2datastring(doc) {
    var datastring = json2csv(doc.map(i => i.data).flat(1)); // get data from each document (so that each document's data objects will be in one array), then flatten the arrays, then convert flattend array to csv
    return datastring;
}

module.exports = { json2csv, doc2datastring }