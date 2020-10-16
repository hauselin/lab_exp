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

function cssFix(req, res, page, code) {
    var referrer = req.get('Referer'); // referrer (click)
    if (referrer === undefined) {  // keyboard entry
        referrer = "/";
    }
    console.log('helper.js cssFix - referring page: ' + referrer);
    if (code === undefined) {
        var code = 200;
    }
    var c = req.originalUrl.split('/').length - 1;
    var c = "../".repeat(c);
    const c1 = c + "public/assets/css/loaders/loader-typing.css";
    const c2 = c + "public/assets/css/theme.css";                
    res.status(code).render(page, { c1: c1, c2: c2, referrer: referrer});
    // res.redirect('back'); // redirects the request back to the referer, defaulting to / when the referer is missing
}

function deepCopy(obj) {
    if (!obj) return obj;
    var out;
    if (Array.isArray(obj)) {
        out = [];
        for (var i = 0; i < obj.length; i++) {
            out.push(deepCopy(obj[i]));
        }
        return out;
    } else if (typeof obj === 'object') {
        out = {};
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                out[key] = deepCopy(obj[key]);
            }
        }
        return out;
    } else {
        return obj;
    }
}

function getParentPath(req) {
    // https://stackoverflow.com/questions/12525928/how-to-get-request-path-with-express-req-object
    var reqpath = req.baseUrl + req.path;
    const strmatches = [...reqpath.matchAll("/")];
    const idx = strmatches[strmatches.length - 1].index;
    return reqpath.slice(0, idx);
}

module.exports = { json2csv, doc2datastring, deleteData, pick, deepCopy, cssFix, getParentPath }
