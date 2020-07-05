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

function fit_ezddm_to_jspsych_data(filtered_trials) {
    // get valid responses before computing ezddm parameters
    var data_sub = filtered_trials.filterCustom(function (trial) { return trial.rt > 50 });
    var cutoffs = mad_cutoffs(data_sub.select('rt').values);
    data_sub = data_sub.filterCustom(function (trial) { return trial.rt > cutoffs[0] }).filterCustom(function (trial) { return trial.rt < cutoffs[1] });
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
    return [median(x) - 3 * mad(x), median(x) + 3 * mad(x)];
    // values < element 0 or values > element 1 are considered outliers
}

function submit_data(results, redirect_url) {
    try {
        $.ajax({
            type: "POST",
            url: "/submit-data",
            data: results,
            contentType: "application/json",
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
                    if (redirect_url) {
                        window.location.replace(redirect_url);
                    }
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