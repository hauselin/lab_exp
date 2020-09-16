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

function submit_data(results, redirect_url) {
    try {
        $.ajax({
            type: "POST",
            url: "/submit-data",
            data: results,
            contentType: "application/json",
            timeout: 5000, // timeout after 5 seconds
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
    var date = new Date();
    const utc_datetime = date.toISOString()
    var utc_date = utc_datetime.split("T")[0].split("-");
    utc_date = { year: Number(utc_date[0]), month: Number(utc_date[1]), day: Number(utc_date[2]) };
    var utc_time = utc_datetime.split("T")[1].split(":");
    utc_time = { hour: Number(utc_time[0]), min: Number(utc_time[1]), sec: Number(utc_time[2].slice(0, 2)) };
    var info_ = {
        subject: get_subject_ID()[0],
        local_subject: get_subject_ID()[1],
        utc_datetime: utc_datetime,
        time: date.getTime(), // milliseconds since January 01, 1970, 00:00:00 UTC
        utc_date: utc_date,
        utc_time: utc_time,
        user_date: date.toLocaleDateString(),
        user_time: date.toLocaleTimeString(),
        user_timezone: date.getTimezoneOffset(),
        platform: navigator.platform, // most browsers, including Chrome, Edge, and Firefox 63 and later, return "Win32" even if running on a 64-bit version of Windows. Internet Explorer and versions of Firefox prior to version 63 still report "Win64"
        browser_info: navigator.userAgent, // browser info
        ip: null,
        city: null,
        region: null,
        country_name: null,
        tasks_completed: [],
    };
    info_ = add_ip_info(info_); // add geolocation info if available
    info_ = { ...info_, ...params }; // spread operator to merge objects (second object will overwrite first one if both have same properties)
    info_ = { ...info_, ...get_query_string() }; // add parameters from query string into info_
    // IMPORTANT: if url query parameters exist, they'll ALWAYS overwrite existing properties with the same name (url parameters take precedence!)

    // info_.datasummary_name = "datasummary_" + info_.uniquestudyid + "_";

    console.log("Friendly reminder: If URL query parameters exist, they'll overwrite properties with the same name in info_")

    // get previous time/uniquestudy info if it exists in sessionStorage
    info_ = get_previous_info(info_)

    // save variables to sessionStorage
    sessionStorage.setObj("info_", info_);
    console.log('saved to sessionStorage: info_');
    sessionStorage.setObj("subject", info_.subject);
    sessionStorage.setObj("type", info_.type);
    console.log('type: ' + info_.type);
    sessionStorage.setObj("uniquestudyid", info_.uniquestudyid);
    console.log('uniquestudyid: ' + info_.uniquestudyid);
    sessionStorage.setObj("condition", info_.condition);
    console.log('condition: ' + info_.condition);
    console.log('utc_datetime: ' + info_.utc_datetime);

    return info_;
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
            console.log("info_ doesn't exist in sessionObject yet!")
        }
    }
    console.log('previous_uniquestudyid: ', info_.previous_uniquestudyid);
    console.log('previous_mins_before: ', info_.previous_mins_before);
    return info_;
}

function create_datasummary_(info_) {
    const datasummary_ = {};
    datasummary_.subject = info_.subject;
    sessionStorage.setObj(info_.datasummary_name, datasummary_);
    console.log('saved to sessionStorage: ' + info_.datasummary_name);
    return datasummary_;
}

// add ip address information onto object
function add_ip_info(info_) {
    try {
        info_.ip = geoplugin_request();
        info_.city = geoplugin_city();
        info_.region = geoplugin_region();
        info_.country_name = geoplugin_countryName();
        info_.country_code = geoplugin_countryCode();
        info_.latitude = geoplugin_latitude();
        info_.longitude = geoplugin_longitude();
    } catch (err) {
        console.log(err);
    }
    return info_;
}

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
        console.log('subject ID found in url parameter: ' + subject);
    } else if (sessionStorage.getItem('subject')) {
        var subject = sessionStorage.getObj('subject');
        console.log('subject ID found in sessionStorage: ' + subject);
    } else {
        const date = new Date();
        var subject = date.getTime() + "_" + random_ID(5);
        console.log('subject ID is randomly generated: ' + subject);
    }
    if (localStorage.getItem('local_subject')) {
        var local_subject = localStorage.getItem('local_subject');
        console.log('subject ID found in localStorage: ' + local_subject);
    } else {
        var local_subject = subject;
        console.log('localStorage subject ID is generated: ' + local_subject);
    }
    sessionStorage.setObj("subject", subject);
    localStorage.setItem("local_subject", local_subject);
    console.log("saved subject ID to sessionStorage: " + subject);
    console.log("saved subject ID to localStorage: " + local_subject);
    return [subject, local_subject];
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
    timeline.push(consent);
    return timeline;
}

