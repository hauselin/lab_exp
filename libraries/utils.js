/**
 * utils.js
 **/

function range(start, end) {
    let ans = [];
    for (let i = start; i < end; i++) {
        ans.push(i);
    }
    return ans;
}

function random_min_max(min, max) {
    return Math.random() * (max - min) + min;
}

// https://stackoverflow.com/questions/6137986/javascript-roundoff-number-to-nearest-0-5
// round to any step
function round(value, step = 1.0) {
    return Math.round(value * 1.0 / step) / (1.0 / step);
}

// generate up to 1000 (but always fewer) values that can be used as inter-trial-intervals (iti)
// values a sampled from an exponential distribution (default lambda parameter = 4)
function iti_exponential(low = 300, high = 1000, lambda = 4, round_step = 50) {
    let itis = [];
    for (let i = 0; i <= 1000; i++) { // 
        let iti = Math.log(1 - Math.random()) / (-lambda) * 1000; // multiply by 1000 to convert iti to milliseconds (ms)
        iti += low;
        if (iti <= high) {
            itis.push(round(iti, round_step));
        }
    }
    return itis;
}

// randomly select one value from an array
function random_choice(array) {
    return array[Math.floor(Math.random() * array.length)];
}


// generate array of length times, filled with x
function rep(x, times) {
    return Array.from({ length: times }).fill(x);
}

// function to create all possible combinations of two arrays of INT
function combine(a1, a2) {
    let x = [];
    for (let i = a1[0]; i <= a1[1]; i++) {
        for (let j = a2[0]; j <= a2[1]; j++) {
            x.push([i, j]);
        }
    }
    return x;
}

// shuffle an array
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function sum(x) {
    var s = 0;
    for (var i = 0; i < x.length; i++) {
        s += x[i];
    }
    return s;
}

function mean(x) {
    return sum(x) / x.length;
}

function variance(x) {
    var m = mean(x);
    var sum_square_error = 0;
    for (var i = 0; i < x.length; i++) {
        sum_square_error += Math.pow(x[i] - m, 2);
    }
    var mse = sum_square_error / (x.length - 1);
    return mse;
}

function divide(x, divisor) {
    return x.map(i => (i / divisor));

}

function logistic(x, mean = 0, scale = 1) {
    return 1 / (1 + Math.exp(-(x - mean) / scale));
}

function logit(x) {
    return Math.log(x / (1 - x));
}

/**
 * Fit ez-drift diffusion model (ezddm)
 * @param  {Number} prop_correct proportion correct (0 to 1.0)
 * @param  {Number} rt_correct_variance_s correct responses reaction time (rt) variance in seconds
 * @param  {Number} rt_correct_mean_s correct responses mean reaction time (rt) in seconds
 * @param  {Number} n_trials number of trials 
 * @return {Object} object containing boundary, drift, and nondecisiontime properties
 */
function ezddm(prop_correct, rt_correct_variance_s, rt_correct_mean_s, n_trials) {
    var s = 0.1; // scaling parameter
    var s2 = s ** 2; // variance 

    if (prop_correct < 0.00001) {
        var a = Number.NaN;
        var v = Number.NaN;
        var ndt = Number.NaN;
        console.log("Proportion correct is 0. Cannot determine parameters D:");
    } else if (prop_correct == 0.5) {
        prop_correct += 0.00001;
        console.log("Proportion correct is close to chance performance (0.5); drift will be close to 0.");
    } else if (prop_correct > 0.9999) {
        prop_correct = 1 - (1 / (2 * n_trials));
        console.log("Proportion correct is 1. Edge correction has been applied.");
    }
    var l = logit(prop_correct);
    var x = l * (l * prop_correct ** 2 - l * prop_correct + prop_correct - 0.5) / rt_correct_variance_s;
    var v = Math.sign(prop_correct - 0.5) * s * x ** (1 / 4); // drift rate parameter
    var a = s2 * logit(prop_correct) / v; // boundary parameter
    var y = -v * a / s2;
    var mdt = (a / (2 * v)) * (1 - Math.exp(y)) / (1 + Math.exp(y)); // mean decision time
    var ndt = rt_correct_mean_s - mdt; // non-decision time parameter
    return { boundary: a, drift: v, nondecisiontime: ndt };
}

function generate_html(text, color = 'black', size = 20, location = [0, 0], bold = false) {
    var div = "<p><div style='font-size:" + size + "px;color:" + color + ";transform: translate(" + location[0] + "px," + location[1] + "px)'>" + text + "</div></p>";
    if (bold) {
        return "<b>" + div + "</b>";
    } else {
        return div;
    }
}

function fit_ezddm_to_jspsych_data(data_sub) {
    // provide preprocessed/cleaned data to the function!!!
    var prop_correct = data_sub.select('acc').mean();
    var correct_rt = data_sub.filter({ "acc": 1 }).select('rt').values;
    correct_rt = divide(correct_rt, 1000);
    var rt_correct_variance_s = variance(correct_rt);
    var rt_correct_mean_s = mean(correct_rt);
    var n_trials = data_sub.select('rt').count();
    var ezparams = ezddm(prop_correct, rt_correct_variance_s, rt_correct_mean_s, n_trials);
    return ezparams;
}

// median function adapted from jspsych
function median(array) {
    if (array.length == 0) { return undefined };
    var numbers = array.slice(0).sort(function (a, b) { return a - b; }); // sort
    var middle = Math.floor(numbers.length / 2);
    var isEven = numbers.length % 2 === 0;
    return isEven ? (numbers[middle] + numbers[middle - 1]) / 2 : numbers[middle];
}

// median absolute deviation for values in array x
function mad(x, constant = 1.4826) {
    var med = median(x);
    var output = [];
    x.forEach(function (e) {
        output.push(Math.abs(e - med));
    });
    return median(output) * constant;
}

// compute deviation for each value
function mad_deviation(x, abs = true) {
    var med = median(x);
    var madev = mad(x);
    if (abs) {
        return x.map(i => Math.abs((i - med) / madev));
    } else {
        return x.map(i => (i - med) / madev);
    }
}

// return the lower and upper bound for excluding values
function mad_cutoffs(x, cutoff = 3.0) {
    return [median(x) - cutoff * mad(x), median(x) + cutoff * mad(x)];
    // values < element 0 or values > element 1 are considered outliers
}

// post request to save data to mongodb
function submit_data(results, redirect_url) {
    try {
        $.ajax({
            type: "POST",
            url: "/submit-data",
            data: results,
            contentType: "application/json;charset=utf-8",
            timeout: 10000, // timeout after 10 seconds
            success: function (data) { // success only runs if html status code is 2xx (success)
                console.log('SUCCESS: ' + data + ' data successfully saved in database'); // data is just the success status code sent from server (200)
            },
            error: function (xhr, status, err) {
                console.log(err);
            },
            complete: function (data) { // complete ALWAYS runs at the end of request
                if (data.status != 200) { // data is the entire response object!
                    console.log('WARNING! Data might not have been saved! Response status: ' + data.status);
                }
                else {
                    console.log('Post request complete.');
                }
                if (redirect_url) {
                    window.location.replace(redirect_url);
                }
            }
        })
    }
    catch (err) {
        console.log('ERROR! submit_data failed to make post request');
        console.log(err);
    }
}

// allows sessionStorage to store arrays and objects using sessionStorage.setObj() and sessionStorage.getObj()
Storage.prototype.setObj = function (key, obj) {
    return this.setItem(key, JSON.stringify(obj))
}
Storage.prototype.getObj = function (key) {
    return JSON.parse(this.getItem(key))
}

// get querry string
function get_query_string() {
    var a = window.location.search.substr(1).split('&');
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i) {
        var p = a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
}

// generate object that stores the user's metadata
// also saves obj to sessionInfo as info_
function create_info_(params) {
    console.log("STARTING...\n  Friendly reminder: If URL query parameters exist, they'll overwrite properties in info_")

    var date = new Date();
    const utc_datetime = date.toISOString()
    var utc_date = utc_datetime.split("T")[0].split("-");
    utc_date = { year: Number(utc_date[0]), month: Number(utc_date[1]), day: Number(utc_date[2]) };
    var utc_time = utc_datetime.split("T")[1].split(":");
    utc_time = { hour: Number(utc_time[0]), min: Number(utc_time[1]), sec: Number(utc_time[2].slice(0, 2)) };
    var info_ = {
        subject: get_subject_ID(),
        utc_datetime: utc_datetime,
        time: date.getTime(), // milliseconds since January 01, 1970, 00:00:00 UTC
        utc_date: utc_date,
        utc_time: utc_time,
        user_date: date.toLocaleDateString(),
        user_time: date.toLocaleTimeString(),
        user_timezone: date.getTimezoneOffset(),
        tasks_completed: [],
    };
    info_ = { ...info_, ...params }; // spread operator to merge objects (second object will overwrite first one if both have same properties)
    info_ = { ...info_, ...get_query_string() }; // add parameters from query string into info_
    // IMPORTANT: if url query parameters exist, they'll ALWAYS overwrite existing properties with the same name (url parameters take precedence!)

    // get previous time/uniquestudy info if it exists in sessionStorage
    info_ = get_previous_info(info_)

    // save stuff to sessionStorage
    sessionStorage.setObj("info_", info_);
    sessionStorage.setObj("subject", info_.subject);
    sessionStorage.setObj("uniquestudyid", info_.uniquestudyid);
    sessionStorage.setObj("type", info_.type);
    sessionStorage.setObj("condition", info_.condition);

    var str2print = "CURRENT INFO\n" +
        "  uniquestudyid: " + info_.uniquestudyid + "\n" +
        "  type: " + info_.type + "\n" +
        "  condition: " + info_.condition + "\n" +
        "  utc_datetime: " + info_.utc_datetime;
    console.log(str2print);

    return info_
}

// add previous study info to info_ if it exists in sessionStorage
function get_previous_info(info_) {
    var x = sessionStorage.getObj('info_');
    info_.previous_uniquestudyid = null;
    info_.previous_time = null;
    info_.previous_mins_before = null;
    if (x) {
        try {
            info_.previous_uniquestudyid = x.uniquestudyid;
            info_.previous_time = x.utc_datetime;
            const time_previous = x.time;
            const time_current = info_.time;
            var time_diff = time_current - time_previous;
            info_.previous_mins_before = time_diff / 60000;
            info_.tasks_completed = x.tasks_completed;
        } catch {
            console.log("info_ doesn't exist in sessionObject yet")
        }
    }
    var str2print = "PREVIOUS INFO\n" +
        '  previous_uniquestudyid: ' + info_.previous_uniquestudyid + "\n" +
        '  previous_mins_before: ' + info_.previous_mins_before;
    console.log(str2print);
    return info_
}

// function create_datasummary_(info_) {
//     const datasummary_ = {};
//     datasummary_.subject = info_.subject;
//     sessionStorage.setObj(info_.datasummary_name, datasummary_);
//     console.log('saved to sessionStorage: ' + info_.datasummary_name);
//     return datasummary_;
// }

// generate random string of specified length
function random_ID(length) {
    var result = '';
    var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// get subject id from url or sessionStorage or generate subject ID
function get_subject_ID() {
    if (get_query_string().hasOwnProperty('subject')) {
        var subject = get_query_string().subject;
        var where = 'FROM URL';
    } else if (sessionStorage.getItem('subject')) {
        var subject = sessionStorage.getObj('subject');
        var where = "RETRIEVED FROM sessionStorage";
    } else {
        var date = new Date();
        var subject = date.getTime() + "_" + random_ID(5);
        var where = "NEWLY GENERATED";
    }
    sessionStorage.setObj("subject", subject);
    console.log("subject id (" + where + ") " + subject + " saved to sessionStorage");
    return subject;
}

function white_on_black() {
    document.body.style.backgroundColor = "black";
    font_colour = 'white';
    return font_colour;
}


// add consent to timeline
function create_consent(timeline, html_path) {
    var consent = {
        on_start: function () {
            document.body.style.backgroundColor = "white"; // always white background for consent page
        },
        type: 'external-html',
        url: html_path,
        cont_btn: "agree_button",
        execute_script: true,
        force_refresh: true,
        on_finish: function () {
            if (black_background) {
                document.body.style.backgroundColor = "black";
            }
        },
    };
    timeline.unshift(consent);
    return timeline;
}

function country_name_to_num(country_name) {
    var index = country_info.findIndex(c => c.country.toLowerCase() === country_name.toLowerCase());
    if (index < 0) {  // if no matching index found, index will be -1
        return null
    } else {
        return Number(country_info[index].numeric)
    }
}

function language_name_to_code(language_name) {
    var index = languages.findIndex(c => c.name.toLowerCase() === language_name.toLowerCase());
    if (index < 0) {
        return null
    } else {
        return languages[index].code
    }
}

function percentile(number, array) {
    var greater_than = array.filter(i => i >= number);
    return (1 - greater_than.length / array.length) * 100
}

function get_viz_subject_info(uniquestudyid, type) {
    const info = sessionStorage.getObj("info_");
    if (info === null || !info.tasks_completed.includes(uniquestudyid)) {
        var subject_id = null;
        var start_time = null;
        document.getElementById('no-data-tag').innerHTML = "Other users' behavior";
        document.getElementById('no-data-text').innerHTML = "To see your own results below, <a href='/" + type + "/" + uniquestudyid + "/'>complete the task</a> first.";
    } else {
        var subject_id = info.subject;
        var start_time = info.time;
        document.getElementById('no-data-tag').innerHTML = "You vs others";
        document.getElementById('no-data-text').innerHTML = 'In the graphs below, the red data points are your results.';
    }
    return [subject_id, start_time]
}

























































































var country_info = [
    {
        country: 'Prefer not to say',
        alpha2: 'NULL',
        alpha3: 'NULL',
        numeric: '0',
    },
    {
        country: 'United States of America',
        alpha2: 'US',
        alpha3: 'USA',
        numeric: '840',
    },
    {
        country: 'Afghanistan',
        alpha2: 'AF',
        alpha3: 'AFG',
        numeric: '004',
    },
    {
        country: 'Åland Islands',
        alpha2: 'AX',
        alpha3: 'ALA',
        numeric: '248',
    },
    {
        country: 'Albania',
        alpha2: 'AL',
        alpha3: 'ALB',
        numeric: '008',
    },
    {
        country: 'Algeria',
        alpha2: 'DZ',
        alpha3: 'DZA',
        numeric: '012',
    },
    {
        country: 'American Samoa',
        alpha2: 'AS',
        alpha3: 'ASM',
        numeric: '016',
    },
    {
        country: 'Andorra',
        alpha2: 'AD',
        alpha3: 'AND',
        numeric: '020',
    },
    {
        country: 'Angola',
        alpha2: 'AO',
        alpha3: 'AGO',
        numeric: '024',
    },
    {
        country: 'Anguilla',
        alpha2: 'AI',
        alpha3: 'AIA',
        numeric: '660',
    },
    {
        country: 'Antarctica',
        alpha2: 'AQ',
        alpha3: 'ATA',
        numeric: '010',
    },
    {
        country: 'Antigua and Barbuda',
        alpha2: 'AG',
        alpha3: 'ATG',
        numeric: '028',
    },
    {
        country: 'Argentina',
        alpha2: 'AR',
        alpha3: 'ARG',
        numeric: '032',
    },
    {
        country: 'Armenia',
        alpha2: 'AM',
        alpha3: 'ARM',
        numeric: '051',
    },
    {
        country: 'Aruba',
        alpha2: 'AW',
        alpha3: 'ABW',
        numeric: '533',
    },
    {
        country: 'Australia',
        alpha2: 'AU',
        alpha3: 'AUS',
        numeric: '036',
    },
    {
        country: 'Austria',
        alpha2: 'AT',
        alpha3: 'AUT',
        numeric: '040',
    },
    {
        country: 'Azerbaijan',
        alpha2: 'AZ',
        alpha3: 'AZE',
        numeric: '031',
    },
    {
        country: 'Bahamas',
        alpha2: 'BS',
        alpha3: 'BHS',
        numeric: '044',
    },
    {
        country: 'Bahrain',
        alpha2: 'BH',
        alpha3: 'BHR',
        numeric: '048',
    },
    {
        country: 'Bangladesh',
        alpha2: 'BD',
        alpha3: 'BGD',
        numeric: '050',
    },
    {
        country: 'Barbados',
        alpha2: 'BB',
        alpha3: 'BRB',
        numeric: '052',
    },
    {
        country: 'Belarus',
        alpha2: 'BY',
        alpha3: 'BLR',
        numeric: '112',
    },
    {
        country: 'Belgium',
        alpha2: 'BE',
        alpha3: 'BEL',
        numeric: '056',
    },
    {
        country: 'Belize',
        alpha2: 'BZ',
        alpha3: 'BLZ',
        numeric: '084',
    },
    {
        country: 'Benin',
        alpha2: 'BJ',
        alpha3: 'BEN',
        numeric: '204',
    },
    {
        country: 'Bermuda',
        alpha2: 'BM',
        alpha3: 'BMU',
        numeric: '060',
    },
    {
        country: 'Bhutan',
        alpha2: 'BT',
        alpha3: 'BTN',
        numeric: '064',
    },
    {
        country: 'Bolivia',
        alpha2: 'BO',
        alpha3: 'BOL',
        numeric: '068',
    },
    {
        country: 'Bonaire, Sint Eustatius and Saba',
        alpha2: 'BQ',
        alpha3: 'BES',
        numeric: '535',
    },
    {
        country: 'Bosnia and Herzegovina',
        alpha2: 'BA',
        alpha3: 'BIH',
        numeric: '070',
    },
    {
        country: 'Botswana',
        alpha2: 'BW',
        alpha3: 'BWA',
        numeric: '072',
    },
    {
        country: 'Bouvet Island',
        alpha2: 'BV',
        alpha3: 'BVT',
        numeric: '074',
    },
    {
        country: 'Brazil',
        alpha2: 'BR',
        alpha3: 'BRA',
        numeric: '076',
    },
    {
        country: 'British Indian Ocean Territory',
        alpha2: 'IO',
        alpha3: 'IOT',
        numeric: '086',
    },
    {
        country: 'Brunei Darussalam',
        alpha2: 'BN',
        alpha3: 'BRN',
        numeric: '096',
    },
    {
        country: 'Bulgaria',
        alpha2: 'BG',
        alpha3: 'BGR',
        numeric: '100',
    },
    {
        country: 'Burkina Faso',
        alpha2: 'BF',
        alpha3: 'BFA',
        numeric: '854',
    },
    {
        country: 'Burundi',
        alpha2: 'BI',
        alpha3: 'BDI',
        numeric: '108',
    },
    {
        country: 'Cabo Verde',
        alpha2: 'CV',
        alpha3: 'CPV',
        numeric: '132',
    },
    {
        country: 'Cambodia',
        alpha2: 'KH',
        alpha3: 'KHM',
        numeric: '116',
    },
    {
        country: 'Cameroon',
        alpha2: 'CM',
        alpha3: 'CMR',
        numeric: '120',
    },
    {
        country: 'Canada',
        alpha2: 'CA',
        alpha3: 'CAN',
        numeric: '124',
    },
    {
        country: 'Cayman Islands',
        alpha2: 'KY',
        alpha3: 'CYM',
        numeric: '136',
    },
    {
        country: 'Central African Republic',
        alpha2: 'CF',
        alpha3: 'CAF',
        numeric: '140',
    },
    {
        country: 'Chad',
        alpha2: 'TD',
        alpha3: 'TCD',
        numeric: '148',
    },
    {
        country: 'Chile',
        alpha2: 'CL',
        alpha3: 'CHL',
        numeric: '152',
    },
    {
        country: 'China',
        alpha2: 'CN',
        alpha3: 'CHN',
        numeric: '156',
    },
    {
        country: 'Christmas Island',
        alpha2: 'CX',
        alpha3: 'CXR',
        numeric: '162',
    },
    {
        country: 'Cocos Islands',
        alpha2: 'CC',
        alpha3: 'CCK',
        numeric: '166',
    },
    {
        country: 'Colombia',
        alpha2: 'CO',
        alpha3: 'COL',
        numeric: '170',
    },
    {
        country: 'Comoros',
        alpha2: 'KM',
        alpha3: 'COM',
        numeric: '174',
    },
    {
        country: 'Congo',
        alpha2: 'CG',
        alpha3: 'COG',
        numeric: '178',
    },
    {
        country: 'Congo',
        alpha2: 'CD',
        alpha3: 'COD',
        numeric: '180',
    },
    {
        country: 'Cook Islands',
        alpha2: 'CK',
        alpha3: 'COK',
        numeric: '184',
    },
    {
        country: 'Costa Rica',
        alpha2: 'CR',
        alpha3: 'CRI',
        numeric: '188',
    },
    {
        country: "Côte d'Ivoire",
        alpha2: 'CI',
        alpha3: 'CIV',
        numeric: '384',
    },
    {
        country: 'Croatia',
        alpha2: 'HR',
        alpha3: 'HRV',
        numeric: '191',
    },
    {
        country: 'Cuba',
        alpha2: 'CU',
        alpha3: 'CUB',
        numeric: '192',
    },
    {
        country: 'Curaçao',
        alpha2: 'CW',
        alpha3: 'CUW',
        numeric: '531',
    },
    {
        country: 'Cyprus',
        alpha2: 'CY',
        alpha3: 'CYP',
        numeric: '196',
    },
    {
        country: 'Czech Republic',
        alpha2: 'CZ',
        alpha3: 'CZE',
        numeric: '203',
    },
    {
        country: 'Denmark',
        alpha2: 'DK',
        alpha3: 'DNK',
        numeric: '208',
    },
    {
        country: 'Djibouti',
        alpha2: 'DJ',
        alpha3: 'DJI',
        numeric: '262',
    },
    {
        country: 'Dominica',
        alpha2: 'DM',
        alpha3: 'DMA',
        numeric: '212',
    },
    {
        country: 'Dominican Republic',
        alpha2: 'DO',
        alpha3: 'DOM',
        numeric: '214',
    },
    {
        country: 'Ecuador',
        alpha2: 'EC',
        alpha3: 'ECU',
        numeric: '218',
    },
    {
        country: 'Egypt',
        alpha2: 'EG',
        alpha3: 'EGY',
        numeric: '818',
    },
    {
        country: 'El Salvador',
        alpha2: 'SV',
        alpha3: 'SLV',
        numeric: '222',
    },
    {
        country: 'Equatorial Guinea',
        alpha2: 'GQ',
        alpha3: 'GNQ',
        numeric: '226',
    },
    {
        country: 'Eritrea',
        alpha2: 'ER',
        alpha3: 'ERI',
        numeric: '232',
    },
    {
        country: 'Estonia',
        alpha2: 'EE',
        alpha3: 'EST',
        numeric: '233',
    },
    {
        country: 'Ethiopia',
        alpha2: 'ET',
        alpha3: 'ETH',
        numeric: '231',
    },
    {
        country: 'Falkland Islands',
        alpha2: 'FK',
        alpha3: 'FLK',
        numeric: '238',
    },
    {
        country: 'Faroe Islands',
        alpha2: 'FO',
        alpha3: 'FRO',
        numeric: '234',
    },
    {
        country: 'Fiji',
        alpha2: 'FJ',
        alpha3: 'FJI',
        numeric: '242',
    },
    {
        country: 'Finland',
        alpha2: 'FI',
        alpha3: 'FIN',
        numeric: '246',
    },
    {
        country: 'France',
        alpha2: 'FR',
        alpha3: 'FRA',
        numeric: '250',
    },
    {
        country: 'French Guiana',
        alpha2: 'GF',
        alpha3: 'GUF',
        numeric: '254',
    },
    {
        country: 'French Polynesia',
        alpha2: 'PF',
        alpha3: 'PYF',
        numeric: '258',
    },
    {
        country: 'French Southern Territories',
        alpha2: 'TF',
        alpha3: 'ATF',
        numeric: '260',
    },
    {
        country: 'Gabon',
        alpha2: 'GA',
        alpha3: 'GAB',
        numeric: '266',
    },
    {
        country: 'Gambia',
        alpha2: 'GM',
        alpha3: 'GMB',
        numeric: '270',
    },
    {
        country: 'Georgia',
        alpha2: 'GE',
        alpha3: 'GEO',
        numeric: '268',
    },
    {
        country: 'Germany',
        alpha2: 'DE',
        alpha3: 'DEU',
        numeric: '276',
    },
    {
        country: 'Ghana',
        alpha2: 'GH',
        alpha3: 'GHA',
        numeric: '288',
    },
    {
        country: 'Gibraltar',
        alpha2: 'GI',
        alpha3: 'GIB',
        numeric: '292',
    },
    {
        country: 'Greece',
        alpha2: 'GR',
        alpha3: 'GRC',
        numeric: '300',
    },
    {
        country: 'Greenland',
        alpha2: 'GL',
        alpha3: 'GRL',
        numeric: '304',
    },
    {
        country: 'Grenada',
        alpha2: 'GD',
        alpha3: 'GRD',
        numeric: '308',
    },
    {
        country: 'Guadeloupe',
        alpha2: 'GP',
        alpha3: 'GLP',
        numeric: '312',
    },
    {
        country: 'Guam',
        alpha2: 'GU',
        alpha3: 'GUM',
        numeric: '316',
    },
    {
        country: 'Guatemala',
        alpha2: 'GT',
        alpha3: 'GTM',
        numeric: '320',
    },
    {
        country: 'Guernsey',
        alpha2: 'GG',
        alpha3: 'GGY',
        numeric: '831',
    },
    {
        country: 'Guinea',
        alpha2: 'GN',
        alpha3: 'GIN',
        numeric: '324',
    },
    {
        country: 'Guinea-Bissau',
        alpha2: 'GW',
        alpha3: 'GNB',
        numeric: '624',
    },
    {
        country: 'Guyana',
        alpha2: 'GY',
        alpha3: 'GUY',
        numeric: '328',
    },
    {
        country: 'Haiti',
        alpha2: 'HT',
        alpha3: 'HTI',
        numeric: '332',
    },
    {
        country: 'Heard Island and McDonald Islands',
        alpha2: 'HM',
        alpha3: 'HMD',
        numeric: '334',
    },
    {
        country: 'Holy See',
        alpha2: 'VA',
        alpha3: 'VAT',
        numeric: '336',
    },
    {
        country: 'Honduras',
        alpha2: 'HN',
        alpha3: 'HND',
        numeric: '340',
    },
    {
        country: 'Hong Kong',
        alpha2: 'HK',
        alpha3: 'HKG',
        numeric: '344',
    },
    {
        country: 'Hungary',
        alpha2: 'HU',
        alpha3: 'HUN',
        numeric: '348',
    },
    {
        country: 'Iceland',
        alpha2: 'IS',
        alpha3: 'ISL',
        numeric: '352',
    },
    {
        country: 'India',
        alpha2: 'IN',
        alpha3: 'IND',
        numeric: '356',
    },
    {
        country: 'Indonesia',
        alpha2: 'ID',
        alpha3: 'IDN',
        numeric: '360',
    },
    {
        country: 'Islamic Republic of Iran',
        alpha2: 'IR',
        alpha3: 'IRN',
        numeric: '364',
    },
    {
        country: 'Iraq',
        alpha2: 'IQ',
        alpha3: 'IRQ',
        numeric: '368',
    },
    {
        country: 'Ireland',
        alpha2: 'IE',
        alpha3: 'IRL',
        numeric: '372',
    },
    {
        country: 'Isle of Man',
        alpha2: 'IM',
        alpha3: 'IMN',
        numeric: '833',
    },
    {
        country: 'Israel',
        alpha2: 'IL',
        alpha3: 'ISR',
        numeric: '376',
    },
    {
        country: 'Italy',
        alpha2: 'IT',
        alpha3: 'ITA',
        numeric: '380',
    },
    {
        country: 'Jamaica',
        alpha2: 'JM',
        alpha3: 'JAM',
        numeric: '388',
    },
    {
        country: 'Japan',
        alpha2: 'JP',
        alpha3: 'JPN',
        numeric: '392',
    },
    {
        country: 'Jersey',
        alpha2: 'JE',
        alpha3: 'JEY',
        numeric: '832',
    },
    {
        country: 'Jordan',
        alpha2: 'JO',
        alpha3: 'JOR',
        numeric: '400',
    },
    {
        country: 'Kazakhstan',
        alpha2: 'KZ',
        alpha3: 'KAZ',
        numeric: '398',
    },
    {
        country: 'Kenya',
        alpha2: 'KE',
        alpha3: 'KEN',
        numeric: '404',
    },
    {
        country: 'Kiribati',
        alpha2: 'KI',
        alpha3: 'KIR',
        numeric: '296',
    },
    {
        country: "Democratic People's Republic of Korea",
        alpha2: 'KP',
        alpha3: 'PRK',
        numeric: '408',
    },
    {
        country: 'Republic of Korea',
        alpha2: 'KR',
        alpha3: 'KOR',
        numeric: '410',
    },
    {
        country: 'Kuwait',
        alpha2: 'KW',
        alpha3: 'KWT',
        numeric: '414',
    },
    {
        country: 'Kyrgyzstan',
        alpha2: 'KG',
        alpha3: 'KGZ',
        numeric: '417',
    },
    {
        country: "Lao People's Democratic Republic",
        alpha2: 'LA',
        alpha3: 'LAO',
        numeric: '418',
    },
    {
        country: 'Latvia',
        alpha2: 'LV',
        alpha3: 'LVA',
        numeric: '428',
    },
    {
        country: 'Lebanon',
        alpha2: 'LB',
        alpha3: 'LBN',
        numeric: '422',
    },
    {
        country: 'Lesotho',
        alpha2: 'LS',
        alpha3: 'LSO',
        numeric: '426',
    },
    {
        country: 'Liberia',
        alpha2: 'LR',
        alpha3: 'LBR',
        numeric: '430',
    },
    {
        country: 'Libya',
        alpha2: 'LY',
        alpha3: 'LBY',
        numeric: '434',
    },
    {
        country: 'Liechtenstein',
        alpha2: 'LI',
        alpha3: 'LIE',
        numeric: '438',
    },
    {
        country: 'Lithuania',
        alpha2: 'LT',
        alpha3: 'LTU',
        numeric: '440',
    },
    {
        country: 'Luxembourg',
        alpha2: 'LU',
        alpha3: 'LUX',
        numeric: '442',
    },
    {
        country: 'Macao',
        alpha2: 'MO',
        alpha3: 'MAC',
        numeric: '446',
    },
    {
        country: 'Macedonia',
        alpha2: 'MK',
        alpha3: 'MKD',
        numeric: '807',
    },
    {
        country: 'Madagascar',
        alpha2: 'MG',
        alpha3: 'MDG',
        numeric: '450',
    },
    {
        country: 'Malawi',
        alpha2: 'MW',
        alpha3: 'MWI',
        numeric: '454',
    },
    {
        country: 'Malaysia',
        alpha2: 'MY',
        alpha3: 'MYS',
        numeric: '458',
    },
    {
        country: 'Maldives',
        alpha2: 'MV',
        alpha3: 'MDV',
        numeric: '462',
    },
    {
        country: 'Mali',
        alpha2: 'ML',
        alpha3: 'MLI',
        numeric: '466',
    },
    {
        country: 'Malta',
        alpha2: 'MT',
        alpha3: 'MLT',
        numeric: '470',
    },
    {
        country: 'Marshall Islands',
        alpha2: 'MH',
        alpha3: 'MHL',
        numeric: '584',
    },
    {
        country: 'Martinique',
        alpha2: 'MQ',
        alpha3: 'MTQ',
        numeric: '474',
    },
    {
        country: 'Mauritania',
        alpha2: 'MR',
        alpha3: 'MRT',
        numeric: '478',
    },
    {
        country: 'Mauritius',
        alpha2: 'MU',
        alpha3: 'MUS',
        numeric: '480',
    },
    {
        country: 'Mayotte',
        alpha2: 'YT',
        alpha3: 'MYT',
        numeric: '175',
    },
    {
        country: 'Mexico',
        alpha2: 'MX',
        alpha3: 'MEX',
        numeric: '484',
    },
    {
        country: 'Federated States of Micronesia',
        alpha2: 'FM',
        alpha3: 'FSM',
        numeric: '583',
    },
    {
        country: 'Republic of Moldova',
        alpha2: 'MD',
        alpha3: 'MDA',
        numeric: '498',
    },
    {
        country: 'Monaco',
        alpha2: 'MC',
        alpha3: 'MCO',
        numeric: '492',
    },
    {
        country: 'Mongolia',
        alpha2: 'MN',
        alpha3: 'MNG',
        numeric: '496',
    },
    {
        country: 'Montenegro',
        alpha2: 'ME',
        alpha3: 'MNE',
        numeric: '499',
    },
    {
        country: 'Montserrat',
        alpha2: 'MS',
        alpha3: 'MSR',
        numeric: '500',
    },
    {
        country: 'Morocco',
        alpha2: 'MA',
        alpha3: 'MAR',
        numeric: '504',
    },
    {
        country: 'Mozambique',
        alpha2: 'MZ',
        alpha3: 'MOZ',
        numeric: '508',
    },
    {
        country: 'Myanmar',
        alpha2: 'MM',
        alpha3: 'MMR',
        numeric: '104',
    },
    {
        country: 'Namibia',
        alpha2: 'NA',
        alpha3: 'NAM',
        numeric: '516',
    },
    {
        country: 'Nauru',
        alpha2: 'NR',
        alpha3: 'NRU',
        numeric: '520',
    },
    {
        country: 'Nepal',
        alpha2: 'NP',
        alpha3: 'NPL',
        numeric: '524',
    },
    {
        country: 'Netherlands',
        alpha2: 'NL',
        alpha3: 'NLD',
        numeric: '528',
    },
    {
        country: 'New Caledonia',
        alpha2: 'NC',
        alpha3: 'NCL',
        numeric: '540',
    },
    {
        country: 'New Zealand',
        alpha2: 'NZ',
        alpha3: 'NZL',
        numeric: '554',
    },
    {
        country: 'Nicaragua',
        alpha2: 'NI',
        alpha3: 'NIC',
        numeric: '558',
    },
    {
        country: 'Niger',
        alpha2: 'NE',
        alpha3: 'NER',
        numeric: '562',
    },
    {
        country: 'Nigeria',
        alpha2: 'NG',
        alpha3: 'NGA',
        numeric: '566',
    },
    {
        country: 'Niue',
        alpha2: 'NU',
        alpha3: 'NIU',
        numeric: '570',
    },
    {
        country: 'Norfolk Island',
        alpha2: 'NF',
        alpha3: 'NFK',
        numeric: '574',
    },
    {
        country: 'Northern Mariana Islands',
        alpha2: 'MP',
        alpha3: 'MNP',
        numeric: '580',
    },
    {
        country: 'Norway',
        alpha2: 'NO',
        alpha3: 'NOR',
        numeric: '578',
    },
    {
        country: 'Oman',
        alpha2: 'OM',
        alpha3: 'OMN',
        numeric: '512',
    },
    {
        country: 'Pakistan',
        alpha2: 'PK',
        alpha3: 'PAK',
        numeric: '586',
    },
    {
        country: 'Palau',
        alpha2: 'PW',
        alpha3: 'PLW',
        numeric: '585',
    },
    {
        country: 'State of Palestine',
        alpha2: 'PS',
        alpha3: 'PSE',
        numeric: '275',
    },
    {
        country: 'Panama',
        alpha2: 'PA',
        alpha3: 'PAN',
        numeric: '591',
    },
    {
        country: 'Papua New Guinea',
        alpha2: 'PG',
        alpha3: 'PNG',
        numeric: '598',
    },
    {
        country: 'Paraguay',
        alpha2: 'PY',
        alpha3: 'PRY',
        numeric: '600',
    },
    {
        country: 'Peru',
        alpha2: 'PE',
        alpha3: 'PER',
        numeric: '604',
    },
    {
        country: 'Philippines',
        alpha2: 'PH',
        alpha3: 'PHL',
        numeric: '608',
    },
    {
        country: 'Pitcairn',
        alpha2: 'PN',
        alpha3: 'PCN',
        numeric: '612',
    },
    {
        country: 'Poland',
        alpha2: 'PL',
        alpha3: 'POL',
        numeric: '616',
    },
    {
        country: 'Portugal',
        alpha2: 'PT',
        alpha3: 'PRT',
        numeric: '620',
    },
    {
        country: 'Puerto Rico',
        alpha2: 'PR',
        alpha3: 'PRI',
        numeric: '630',
    },
    {
        country: 'Qatar',
        alpha2: 'QA',
        alpha3: 'QAT',
        numeric: '634',
    },
    {
        country: 'Réunion',
        alpha2: 'RE',
        alpha3: 'REU',
        numeric: '638',
    },
    {
        country: 'Romania',
        alpha2: 'RO',
        alpha3: 'ROU',
        numeric: '642',
    },
    {
        country: 'Russian Federation',
        alpha2: 'RU',
        alpha3: 'RUS',
        numeric: '643',
    },
    {
        country: 'Rwanda',
        alpha2: 'RW',
        alpha3: 'RWA',
        numeric: '646',
    },
    {
        country: 'Saint Barthélemy',
        alpha2: 'BL',
        alpha3: 'BLM',
        numeric: '652',
    },
    {
        country: 'Saint Helena, Ascension and Tristan da Cunha',
        alpha2: 'SH',
        alpha3: 'SHN',
        numeric: '654',
    },
    {
        country: 'Saint Kitts and Nevis',
        alpha2: 'KN',
        alpha3: 'KNA',
        numeric: '659',
    },
    {
        country: 'Saint Lucia',
        alpha2: 'LC',
        alpha3: 'LCA',
        numeric: '662',
    },
    {
        country: 'Saint Martin',
        alpha2: 'MF',
        alpha3: 'MAF',
        numeric: '663',
    },
    {
        country: 'Saint Pierre and Miquelon',
        alpha2: 'PM',
        alpha3: 'SPM',
        numeric: '666',
    },
    {
        country: 'Saint Vincent and the Grenadines',
        alpha2: 'VC',
        alpha3: 'VCT',
        numeric: '670',
    },
    {
        country: 'Samoa',
        alpha2: 'WS',
        alpha3: 'WSM',
        numeric: '882',
    },
    {
        country: 'San Marino',
        alpha2: 'SM',
        alpha3: 'SMR',
        numeric: '674',
    },
    {
        country: 'Sao Tome and Principe',
        alpha2: 'ST',
        alpha3: 'STP',
        numeric: '678',
    },
    {
        country: 'Saudi Arabia',
        alpha2: 'SA',
        alpha3: 'SAU',
        numeric: '682',
    },
    {
        country: 'Senegal',
        alpha2: 'SN',
        alpha3: 'SEN',
        numeric: '686',
    },
    {
        country: 'Serbia',
        alpha2: 'RS',
        alpha3: 'SRB',
        numeric: '688',
    },
    {
        country: 'Seychelles',
        alpha2: 'SC',
        alpha3: 'SYC',
        numeric: '690',
    },
    {
        country: 'Sierra Leone',
        alpha2: 'SL',
        alpha3: 'SLE',
        numeric: '694',
    },
    {
        country: 'Singapore',
        alpha2: 'SG',
        alpha3: 'SGP',
        numeric: '702',
    },
    {
        country: 'Sint Maarten',
        alpha2: 'SX',
        alpha3: 'SXM',
        numeric: '534',
    },
    {
        country: 'Slovakia',
        alpha2: 'SK',
        alpha3: 'SVK',
        numeric: '703',
    },
    {
        country: 'Slovenia',
        alpha2: 'SI',
        alpha3: 'SVN',
        numeric: '705',
    },
    {
        country: 'Solomon Islands',
        alpha2: 'SB',
        alpha3: 'SLB',
        numeric: '090',
    },
    {
        country: 'Somalia',
        alpha2: 'SO',
        alpha3: 'SOM',
        numeric: '706',
    },
    {
        country: 'South Africa',
        alpha2: 'ZA',
        alpha3: 'ZAF',
        numeric: '710',
    },
    {
        country: 'South Georgia and the South Sandwich Islands',
        alpha2: 'GS',
        alpha3: 'SGS',
        numeric: '239',
    },
    {
        country: 'South Sudan',
        alpha2: 'SS',
        alpha3: 'SSD',
        numeric: '728',
    },
    {
        country: 'Spain',
        alpha2: 'ES',
        alpha3: 'ESP',
        numeric: '724',
    },
    {
        country: 'Sri Lanka',
        alpha2: 'LK',
        alpha3: 'LKA',
        numeric: '144',
    },
    {
        country: 'Sudan',
        alpha2: 'SD',
        alpha3: 'SDN',
        numeric: '729',
    },
    {
        country: 'Suriname',
        alpha2: 'SR',
        alpha3: 'SUR',
        numeric: '740',
    },
    {
        country: 'Svalbard and Jan Mayen',
        alpha2: 'SJ',
        alpha3: 'SJM',
        numeric: '744',
    },
    {
        country: 'Swaziland',
        alpha2: 'SZ',
        alpha3: 'SWZ',
        numeric: '748',
    },
    {
        country: 'Sweden',
        alpha2: 'SE',
        alpha3: 'SWE',
        numeric: '752',
    },
    {
        country: 'Switzerland',
        alpha2: 'CH',
        alpha3: 'CHE',
        numeric: '756',
    },
    {
        country: 'Syrian Arab Republic',
        alpha2: 'SY',
        alpha3: 'SYR',
        numeric: '760',
    },
    {
        country: 'Taiwan, Province of China',
        alpha2: 'TW',
        alpha3: 'TWN',
        numeric: '158',
    },
    {
        country: 'Tajikistan',
        alpha2: 'TJ',
        alpha3: 'TJK',
        numeric: '762',
    },
    {
        country: 'United Republic of Tanzania',
        alpha2: 'TZ',
        alpha3: 'TZA',
        numeric: '834',
    },
    {
        country: 'Thailand',
        alpha2: 'TH',
        alpha3: 'THA',
        numeric: '764',
    },
    {
        country: 'Timor-Leste',
        alpha2: 'TL',
        alpha3: 'TLS',
        numeric: '626',
    },
    {
        country: 'Togo',
        alpha2: 'TG',
        alpha3: 'TGO',
        numeric: '768',
    },
    {
        country: 'Tokelau',
        alpha2: 'TK',
        alpha3: 'TKL',
        numeric: '772',
    },
    {
        country: 'Tonga',
        alpha2: 'TO',
        alpha3: 'TON',
        numeric: '776',
    },
    {
        country: 'Trinidad and Tobago',
        alpha2: 'TT',
        alpha3: 'TTO',
        numeric: '780',
    },
    {
        country: 'Tunisia',
        alpha2: 'TN',
        alpha3: 'TUN',
        numeric: '788',
    },
    {
        country: 'Turkey',
        alpha2: 'TR',
        alpha3: 'TUR',
        numeric: '792',
    },
    {
        country: 'Turkmenistan',
        alpha2: 'TM',
        alpha3: 'TKM',
        numeric: '795',
    },
    {
        country: 'Turks and Caicos Islands',
        alpha2: 'TC',
        alpha3: 'TCA',
        numeric: '796',
    },
    {
        country: 'Tuvalu',
        alpha2: 'TV',
        alpha3: 'TUV',
        numeric: '798',
    },
    {
        country: 'Uganda',
        alpha2: 'UG',
        alpha3: 'UGA',
        numeric: '800',
    },
    {
        country: 'Ukraine',
        alpha2: 'UA',
        alpha3: 'UKR',
        numeric: '804',
    },
    {
        country: 'United Arab Emirates',
        alpha2: 'AE',
        alpha3: 'ARE',
        numeric: '784',
    },
    {
        country: 'United Kingdom of Great Britain and Northern Ireland',
        alpha2: 'GB',
        alpha3: 'GBR',
        numeric: '826',
    },
    {
        country: 'United States Minor Outlying Islands',
        alpha2: 'UM',
        alpha3: 'UMI',
        numeric: '581',
    },
    {
        country: 'Uruguay',
        alpha2: 'UY',
        alpha3: 'URY',
        numeric: '858',
    },
    {
        country: 'Uzbekistan',
        alpha2: 'UZ',
        alpha3: 'UZB',
        numeric: '860',
    },
    {
        country: 'Vanuatu',
        alpha2: 'VU',
        alpha3: 'VUT',
        numeric: '548',
    },
    {
        country: 'Venezuela (Bolivarian Republic of)',
        alpha2: 'VE',
        alpha3: 'VEN',
        numeric: '862',
    },
    {
        country: 'Viet Nam',
        alpha2: 'VN',
        alpha3: 'VNM',
        numeric: '704',
    },
    {
        country: 'Virgin Islands',
        alpha2: 'VG',
        alpha3: 'VGB',
        numeric: '092',
    },
    {
        country: 'Virgin Islands',
        alpha2: 'VI',
        alpha3: 'VIR',
        numeric: '850',
    },
    {
        country: 'Wallis and Futuna',
        alpha2: 'WF',
        alpha3: 'WLF',
        numeric: '876',
    },
    {
        country: 'Western Sahara',
        alpha2: 'EH',
        alpha3: 'ESH',
        numeric: '732',
    },
    {
        country: 'Yemen',
        alpha2: 'YE',
        alpha3: 'YEM',
        numeric: '887',
    },
    {
        country: 'Zambia',
        alpha2: 'ZM',
        alpha3: 'ZMB',
        numeric: '894',
    },
    {
        country: 'Zimbabwe',
        alpha2: 'ZW',
        alpha3: 'ZWE',
        numeric: '716',
    },
];

const languages = [
    { code: 'null', name: 'Prefer not to say' },
    { code: 'ab', name: 'Abkhazian' },
    { code: 'aa', name: 'Afar' },
    { code: 'af', name: 'Afrikaans' },
    { code: 'ak', name: 'Akan' },
    { code: 'sq', name: 'Albanian' },
    { code: 'am', name: 'Amharic' },
    { code: 'ar', name: 'Arabic' },
    { code: 'an', name: 'Aragonese' },
    { code: 'hy', name: 'Armenian' },
    { code: 'as', name: 'Assamese' },
    { code: 'av', name: 'Avaric' },
    { code: 'ae', name: 'Avestan' },
    { code: 'ay', name: 'Aymara' },
    { code: 'az', name: 'Azerbaijani' },
    { code: 'bm', name: 'Bambara' },
    { code: 'ba', name: 'Bashkir' },
    { code: 'eu', name: 'Basque' },
    { code: 'be', name: 'Belarusian' },
    { code: 'bn', name: 'Bengali' },
    { code: 'bh', name: 'Bihari languages' },
    { code: 'bi', name: 'Bislama' },
    { code: 'bs', name: 'Bosnian' },
    { code: 'br', name: 'Breton' },
    { code: 'bg', name: 'Bulgarian' },
    { code: 'my', name: 'Burmese' },
    { code: 'ca', name: 'Catalan, Valencian' },
    { code: 'km', name: 'Central Khmer' },
    { code: 'ch', name: 'Chamorro' },
    { code: 'ce', name: 'Chechen' },
    { code: 'ny', name: 'Chichewa, Chewa, Nyanja' },
    { code: 'zh', name: 'Chinese' },
    { code: 'cu', name: 'Church Slavonic, Old Bulgarian, Old Church Slavonic' },
    { code: 'cv', name: 'Chuvash' },
    { code: 'kw', name: 'Cornish' },
    { code: 'co', name: 'Corsican' },
    { code: 'cr', name: 'Cree' },
    { code: 'hr', name: 'Croatian' },
    { code: 'cs', name: 'Czech' },
    { code: 'da', name: 'Danish' },
    { code: 'dv', name: 'Divehi, Dhivehi, Maldivian' },
    { code: 'nl', name: 'Dutch, Flemish' },
    { code: 'dz', name: 'Dzongkha' },
    { code: 'en', name: 'English' },
    { code: 'eo', name: 'Esperanto' },
    { code: 'et', name: 'Estonian' },
    { code: 'ee', name: 'Ewe' },
    { code: 'fo', name: 'Faroese' },
    { code: 'fj', name: 'Fijian' },
    { code: 'fi', name: 'Finnish' },
    { code: 'fr', name: 'French' },
    { code: 'ff', name: 'Fulah' },
    { code: 'gd', name: 'Gaelic, Scottish Gaelic' },
    { code: 'gl', name: 'Galician' },
    { code: 'lg', name: 'Ganda' },
    { code: 'ka', name: 'Georgian' },
    { code: 'de', name: 'German' },
    { code: 'ki', name: 'Gikuyu, Kikuyu' },
    { code: 'el', name: 'Greek (Modern)' },
    { code: 'kl', name: 'Greenlandic, Kalaallisut' },
    { code: 'gn', name: 'Guarani' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'ht', name: 'Haitian, Haitian Creole' },
    { code: 'ha', name: 'Hausa' },
    { code: 'he', name: 'Hebrew' },
    { code: 'hz', name: 'Herero' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ho', name: 'Hiri Motu' },
    { code: 'hu', name: 'Hungarian' },
    { code: 'is', name: 'Icelandic' },
    { code: 'io', name: 'Ido' },
    { code: 'ig', name: 'Igbo' },
    { code: 'id', name: 'Indonesian' },
    { code: 'ia', name: 'Interlingua (International Auxiliary Language Association)' },
    { code: 'ie', name: 'Interlingue' },
    { code: 'iu', name: 'Inuktitut' },
    { code: 'ik', name: 'Inupiaq' },
    { code: 'ga', name: 'Irish' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'jv', name: 'Javanese' },
    { code: 'kn', name: 'Kannada' },
    { code: 'kr', name: 'Kanuri' },
    { code: 'ks', name: 'Kashmiri' },
    { code: 'kk', name: 'Kazakh' },
    { code: 'rw', name: 'Kinyarwanda' },
    { code: 'kv', name: 'Komi' },
    { code: 'kg', name: 'Kongo' },
    { code: 'ko', name: 'Korean' },
    { code: 'kj', name: 'Kwanyama, Kuanyama' },
    { code: 'ku', name: 'Kurdish' },
    { code: 'ky', name: 'Kyrgyz' },
    { code: 'lo', name: 'Lao' },
    { code: 'la', name: 'Latin' },
    { code: 'lv', name: 'Latvian' },
    { code: 'lb', name: 'Letzeburgesch, Luxembourgish' },
    { code: 'li', name: 'Limburgish, Limburgan, Limburger' },
    { code: 'ln', name: 'Lingala' },
    { code: 'lt', name: 'Lithuanian' },
    { code: 'lu', name: 'Luba-Katanga' },
    { code: 'mk', name: 'Macedonian' },
    { code: 'mg', name: 'Malagasy' },
    { code: 'ms', name: 'Malay' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'mt', name: 'Maltese' },
    { code: 'gv', name: 'Manx' },
    { code: 'mi', name: 'Maori' },
    { code: 'mr', name: 'Marathi' },
    { code: 'mh', name: 'Marshallese' },
    { code: 'ro', name: 'Moldovan, Moldavian, Romanian' },
    { code: 'mn', name: 'Mongolian' },
    { code: 'na', name: 'Nauru' },
    { code: 'nv', name: 'Navajo, Navaho' },
    { code: 'nd', name: 'Northern Ndebele' },
    { code: 'ng', name: 'Ndonga' },
    { code: 'ne', name: 'Nepali' },
    { code: 'se', name: 'Northern Sami' },
    { code: 'no', name: 'Norwegian' },
    { code: 'nb', name: 'Norwegian Bokmål' },
    { code: 'nn', name: 'Norwegian Nynorsk' },
    { code: 'ii', name: 'Nuosu, Sichuan Yi' },
    { code: 'oc', name: 'Occitan (post 1500)' },
    { code: 'oj', name: 'Ojibwa' },
    { code: 'or', name: 'Oriya' },
    { code: 'om', name: 'Oromo' },
    { code: 'os', name: 'Ossetian, Ossetic' },
    { code: 'pi', name: 'Pali' },
    { code: 'pa', name: 'Panjabi, Punjabi' },
    { code: 'ps', name: 'Pashto, Pushto' },
    { code: 'fa', name: 'Persian' },
    { code: 'pl', name: 'Polish' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'qu', name: 'Quechua' },
    { code: 'rm', name: 'Romansh' },
    { code: 'rn', name: 'Rundi' },
    { code: 'ru', name: 'Russian' },
    { code: 'sm', name: 'Samoan' },
    { code: 'sg', name: 'Sango' },
    { code: 'sa', name: 'Sanskrit' },
    { code: 'sc', name: 'Sardinian' },
    { code: 'sr', name: 'Serbian' },
    { code: 'sn', name: 'Shona' },
    { code: 'sd', name: 'Sindhi' },
    { code: 'si', name: 'Sinhala, Sinhalese' },
    { code: 'sk', name: 'Slovak' },
    { code: 'sl', name: 'Slovenian' },
    { code: 'so', name: 'Somali' },
    { code: 'st', name: 'Sotho, Southern' },
    { code: 'nr', name: 'South Ndebele' },
    { code: 'es', name: 'Spanish, Castilian' },
    { code: 'su', name: 'Sundanese' },
    { code: 'sw', name: 'Swahili' },
    { code: 'ss', name: 'Swati' },
    { code: 'sv', name: 'Swedish' },
    { code: 'tl', name: 'Tagalog' },
    { code: 'ty', name: 'Tahitian' },
    { code: 'tg', name: 'Tajik' },
    { code: 'ta', name: 'Tamil' },
    { code: 'tt', name: 'Tatar' },
    { code: 'te', name: 'Telugu' },
    { code: 'th', name: 'Thai' },
    { code: 'bo', name: 'Tibetan' },
    { code: 'ti', name: 'Tigrinya' },
    { code: 'to', name: 'Tonga (Tonga Islands)' },
    { code: 'ts', name: 'Tsonga' },
    { code: 'tn', name: 'Tswana' },
    { code: 'tr', name: 'Turkish' },
    { code: 'tk', name: 'Turkmen' },
    { code: 'tw', name: 'Twi' },
    { code: 'ug', name: 'Uighur, Uyghur' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'ur', name: 'Urdu' },
    { code: 'uz', name: 'Uzbek' },
    { code: 've', name: 'Venda' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'vo', name: 'Volap_k' },
    { code: 'wa', name: 'Walloon' },
    { code: 'cy', name: 'Welsh' },
    { code: 'fy', name: 'Western Frisian' },
    { code: 'wo', name: 'Wolof' },
    { code: 'xh', name: 'Xhosa' },
    { code: 'yi', name: 'Yiddish' },
    { code: 'yo', name: 'Yoruba' },
    { code: 'za', name: 'Zhuang, Chuang' },
    { code: 'zu', name: 'Zulu' }
];

const religions = [
    'Prefer not to say',
    'No religion',
    'Christianity',
    'Islam',
    'Hinduism',
    'Buddhism',
    'Folk religions',
    'Chinese folk religions',
    'Shinto',
    'Sikhism',
    'Judaism',
    'Jainism',
    'Baháʼí Faith',
    'Caodaism',
    'Cheondoism',
    'Tenrikyo',
    'Wicca',
    'Church of World Messianity',
    'Seicho-no-le',
    'Rastafari movement',
    'Unitarian Universalism'
];

const race_and_ethnicities = [
    'Prefer not to say',
    'American Indian or Alaskan Native',
    'Asian',
    'Black or African American',
    'Hispanic or Latino',
    'Native Hawaiian or Other Pacific Islander',
    'White'
]