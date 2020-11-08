// DEFINE TASK (required)
const taskinfo = {
    type: 'task', // 'task', 'survey', or 'study'
    uniquestudyid: 'updatemath', // unique task id: must be IDENTICAL to directory name
    desc: 'Mental math', // brief description of task
    condition: null, // experiment/task condition
    redirect_url: false // set to false if no redirection required
};

var info_ = create_info_(taskinfo);  // initialize subject id and task parameters

const debug = true;
var font_colour = "black";
var background_colour = "white";
set_colour(font_colour, background_colour);

var num_to_update = 1; // number to add to every digit
var n_digits = 2; // amount of numbers to show
var n_distract_response = 3; // amount of distractors
var n_trial = 2; // number of trials and the amount of sequences to show

if (n_distract_response == 3) {
    arrow_choices = [37, 38, 39, 40]
} else if (n_distract_response == 1) {
    arrow_choices = [37, 39]
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
            correct_num += 10;
        } else if (correct_num > 9) {
            correct_num -= 10;
        }
        str_output = str_output.concat(correct_num.toString()); // concat string integers
        array_output.push(correct_num);
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
    return [array].concat(shuffle(result.slice(0, n_distractors))); // [array + distractors]
}

function generate_sequence(n_digits) {
    var sequence = [];
    for (i = 0; i < n_digits; i++) {
        sequence.push(Math.floor(Math.random() * 10))
    }
    return sequence
}

var prompt = {
    type: "html-keyboard-response",
    stimulus: function () {
        return generate_html("Please add the number below to each of the following numbers prompted: <br>", font_colour, 20) + generate_html(random_number.toString(), font_colour, 30);
    },
    choices: jsPsych.NO_KEYS,
    trial_duration: 2000,
    data: { event: "stimulus" },
    post_trial_gap: 500
}

var temp_digits = []
var number_sequence = {
    timeline: [
        {
            type: "html-keyboard-response",
            stimulus: function () {
                return generate_html(jsPsych.timelineVariable('digit', true), font_colour, 30);
            },
            choices: jsPsych.NO_KEYS,
            trial_duration: 1000,
            data: { event: "stimulus" },
            post_trial_gap: 500,
            on_finish: function (data) {
                data.digit = jsPsych.timelineVariable('digit', true);
                temp_digits.push(data.digit);
            }
        }
    ],
    timeline_variables: Array.from(generate_sequence(n_digits), x => Object({ digit: x })),
}

var response = {
    type: "html-keyboard-response",
    stimulus: function () {
        options_key = [];
        options = generate_similar_numbers(temp_digits, n_distract_response);
        options.map(x => options_key.push(x))
        return generate_html(options_key, font_colour, 30);
    },
    choices: arrow_choices,
    trial_duration: 10000,
    data: { event: "stimulus" },
    post_trial_gap: 500,
}

var timeline = [];
timeline.push(number_sequence);
timeline.push(response);

jsPsych.init({
    timeline: timeline,
    on_finish: function () {
        if (debug) {
            jsPsych.data.displayData();
        }
    }
});