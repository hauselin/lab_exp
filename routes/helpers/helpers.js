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

// function for donwload routes
function doc2datastring(doc) {
    // get data from each document (so that each document's data objects will be in one array), then flatten the arrays, then convert flattend array to csv
    return json2csv(doc.map(i => i.data).flat(1));
}

// pick/select object keys
function pick(obj, keys) {
    return keys.map(k => k in obj ? { [k]: obj[k] } : {})
        .reduce((res, o) => Object.assign(res, o), {});
}

// delete data from mongodb
function deleteData(datalibrary, doc) {
    for (var i = 0; i < doc.length; i++) {
        datalibrary.findByIdAndDelete(doc[i]._id, function (err) {
            if (err) {
                console.log(err);
            }
        })
    };
}

function isLoggedIn(req, res, next) { // //req.isAuthenticated() will return true if user is logged in
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports = { json2csv, doc2datastring, deleteData, pick, isLoggedIn }