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

// generate mental math updating array
// determine correct response
function number_update(array1, array2) {
    var array_output = [];
    var str_output = '';
    for (i = 0; i < array1.length; i++) {
        if (array2.length < array1.length) {
            if (array2[0] > 9) throw "number in array2 must be < 10";
            if (array2[0] < -9) throw "number in array2 must be > -10";
            var correct_num = array1[i] + array2[0]; // if array2 is shorter than array1, always add the first element of array2 to each element in array1
        } else if (array1.length == array2.length) {
            if (array2[i] > 9) throw "number in array2 must be < 10";
            if (array2[i] < -9) throw "number in array2 must be > -10";
            var correct_num = array1[i] + array2[i];
        };
        if (correct_num < 0) {
            correct_num = 10 - Number(correct_num.toString().charAt(correct_num.toString().length - 1));
        } else if (correct_num > 9) {
            correct_num = Number(correct_num.toString().charAt(correct_num.toString().length - 1));
        }
        str_output = str_output.concat(correct_num.toString()); // concat string integers
        array_output.push(correct_num)
    }
    return [array_output, str_output]
}

// create distractors/wrong responses
function generate_similar_numbers(array, n_distractors) {
    var result = [];
    var v = 1; // distractor's difference from correct answer, changes with each additional distractor
    while (result.length < n_distractors) { // loop stops when the result array is full
        for (i = 0; i < array.length; i++) { // iterate through the different indeces of different distractors
            result.push(array.slice(0, array.length));
            result.push(array.slice(0, array.length)); // append two copies of the correct answer into the result
            var y = array[i] // y is a copy of the correct answer's digit at different indeces
            var y_plus = y + v;
            var y_minus = y - v;
            if (y_plus > 9) {
                y_plus -= 10;
            };
            if (y_minus < 0) {
                y_minus += 10;
            };
            result[result.length - 1][i] = y_plus;
            result[result.length - 2][i] = y_minus; // the two copies undergo different changes at the same index.
            // in the next iteration, newly pushed distractors change at the next index, but the same locations for the previous iteration's distractors do not change.
        };
        v += 1;
    };
    return shuffle(result.slice(0, n_distractors));
}