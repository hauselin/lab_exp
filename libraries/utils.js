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

// generate mental math updating array
function number_update(array1, array2, n_distractors, distractor_range=1) { // new parameter distractor_range that specifies the range that each digit in the distractor can differ from the correct answer
    var output = [];
    var correct = '';
    // determine correct response
    for (i = 0; i < array1.length; i++) {
        if (array2.length < array1.length) {
            var correct_num = array1[i] + array2[0]; // if array2 is shorter than array1, always add the first element of array2 to each element in array1
        } else if (array1.length == array2.length) {
            var correct_num = array1[i] + array2[i];
        }
        if (correct_num >=0) {
            correct = correct.concat(correct_num.toString().charAt(correct_num.toString().length - 1)); // concat string integers
        } else {
            correct = correct.concat('-', correct_num.toString().charAt(correct_num.toString().length - 1));
        }
    }
    output.push(correct);
    // create distractors/wrong responses
    for (i = 0; i < n_distractors; i++) {
        var distractor = '';
        for (j = 0; j < correct.length; j++) {
            if (j > 0 && (correct.charAt(j) != '-')) {
                if (correct.charAt(j - 1) != '-') {
                    var distractor_num = Number(correct.charAt(j)) + (Math.floor(Math.random() * (1 + 2 * distractor_range)) + -1 * (distractor_range)); // makes one of the digits for a distractor by adding a random integer between 0 and 2 (inclusive) to -1, making the overall difference +/-1
                    distractor_num = distractor_num.toString();
                    if (distractor_num >= 0) {
                        distractor = distractor.concat(distractor_num.charAt(distractor_num.length - 1));
                    } else {
                        distractor = distractor.concat('-', distractor_num.charAt(distractor_num.length - 1));
                    }
                } else {
                    var distractor_num = -Number(correct.charAt(j)) + (Math.floor(Math.random() * (1 + 2 * distractor_range)) + -1 * (distractor_range)); // makes one of the digits for a distractor by adding a random integer between 0 and 2 (inclusive) to -1, making the overall difference +/-1
                    distractor_num = distractor_num.toString();
                    // console.log(distractor_num);
                    if (distractor_num.charAt(0) != '-') {
                        distractor = distractor.concat(distractor_num.charAt(distractor_num.length - 1));
                    } else {
                        distractor = distractor.concat('-', distractor_num.charAt(distractor_num.length - 1));
                    }
                    console.log(distractor)
                }
            }
        }
        output.push(distractor);
    }
    return output;
}