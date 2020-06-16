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
    return output;
}

function generate_html(text, color='black', size=20, location=['0px','0px'], bold=false) {
    var div = "<p><div style='font-size:" + size.toString() + "px;color:" + color + ";transform: translate(" + location.toString() + ")'>" + text + "</div></p>"
    if (bold) {
        return "<b>" + div + "</b>";
    } else {
        return div;
    }
}