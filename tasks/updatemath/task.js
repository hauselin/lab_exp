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

// DEFINE TASK PARAMETERS (required)
var num_to_update = -7; // number to add to every digit
var n_digits = 3; // amount of numbers to show (must be > 1)
var n_distract_response = 3; // amount of distractors
var n_trial = 2; // number of trials and the amount of sequences to show
var duration_digit = 500; // how long to show each digit (ms)
var duration_post_digit = 200;  // pause duration after each digit
var feedback_duration = 1500;
var rt_update_deadline = 3000;

if (debug) {
    // rt_update_deadline = 60000;
}

// DO NOT EDIT BELOW UNLESS YOU KNOW WHAT YOU'RE DOING 
jsPsych.data.addProperties({  // do not edit this section unnecessarily!
    subject: info_.subject,
    type: taskinfo.type,
    uniquestudyid: taskinfo.uniquestudyid,
    desc: taskinfo.desc,
    condition: taskinfo.condition,
});

// keycode for responses
choices = [
    { keycode: 37 },
    { keycode: 39 },
];
if (n_distract_response == 3) {
    choices = choices.concat([{ keycode: 38 }, { keycode: 40 }]) // 3 distractors + 1 correct
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

// generate random digits
function generate_sequence(n_digits) {
    var sequence = [];
    for (i = 0; i < n_digits; i++) {
        sequence.push(Math.floor(Math.random() * 10))
    }
    return sequence
}

// cue/prompt above each digit (string) (e.g., +3, -2)
function update_prompt(digit) {
    var s;
    if (digit >= 0) {
        s = "+" + digit;
    } else {
        s = "&#x2212;" + Math.abs(digit);  // minus sign
    }
    return s;
}

function process_choices(choices) {
    var choices_copy = jsPsych.utils.deepCopy(choices);
    var shuffled_options = [];
    var options = generate_similar_numbers(temp_digits, n_distract_response);
    options = options.map(x => x.join(''));
    shuffled_options.push(
        { prompt: options[0], correct: true }
    );
    for (i = 1; i < n_distract_response + 1; i++) {
        shuffled_options.push(
            { prompt: options[i], correct: false }
        )
    }
    shuffled_options = shuffle(shuffled_options)
    for (i = 0; i < n_distract_response + 1; i++) {
        choices_copy[i] = Object.assign(choices_copy[i], shuffled_options[i]);
    }
    return choices_copy
}

var prompt_digit = {
    type: "html-keyboard-response",
    stimulus: function () {
        var remind = update_prompt(num_to_update) + " to each digit";
        remind = generate_html(remind, font_colour, 30);
        return remind
    },
    choices: jsPsych.NO_KEYS,
    trial_duration: 1000,
    data: { event: "digit_prompt" },
    post_trial_gap: 750
};

var temp_digits = [];
var number_sequence = {
    timeline: [
        {
            type: "html-keyboard-response",
            stimulus: function () {
                var remind = update_prompt(num_to_update);
                remind = generate_html(remind, font_colour, 30) + "<br>";
                var d = generate_html(jsPsych.timelineVariable('digit', true), font_colour, 80)
                return remind + d;
            },
            choices: jsPsych.NO_KEYS,
            trial_duration: duration_digit,
            data: { event: "digit" },
            post_trial_gap: duration_post_digit,
            on_finish: function (data) {
                data.digit = jsPsych.timelineVariable('digit', true);
                temp_digits.push(data.digit);
            }
        }
    ],
    timeline_variables: Array.from(generate_sequence(n_digits), x => Object({ digit: x })),
}

var choices_shuffle;
var response = {
    type: "html-keyboard-response",
    stimulus: function () {
        choices_shuffle = process_choices(choices);
        prompt_html = generate_html(choices_shuffle[0].prompt, font_colour, 30, [-100, 25]) + generate_html(choices_shuffle[1].prompt, font_colour, 30, [100, -25]);
        if (n_distract_response == 3) {
            prompt_html = prompt_html.concat(generate_html(choices_shuffle[2].prompt, font_colour, 30, [0, -125]) + generate_html(choices_shuffle[3].prompt, font_colour, 30, [0, -70]));
        }
        return prompt_html;
    },
    choices: choices.map(x => x.keycode),
    trial_duration: rt_update_deadline,
    data: { event: "response" },
    post_trial_gap: 500,
    on_finish: function(data) {
        chosen = choices_shuffle.filter(x => x.keycode == data.key_press)[0]
        if (!chosen || !chosen.correct) {
            data.acc = 0;
        } else {
            data.acc = 1;
        }
        data.choices = choices;
    }
}

var feedback = {
    type: "html-keyboard-response",
    stimulus: function () {
        last_trial_data = jsPsych.data.getLastTrialData();
        if (last_trial_data.select('acc').values[0] > 0) {
            var prompt = "correct, your reaction time was " + Math.round(last_trial_data.select('rt').values[0]) + " ms";
        } else {
            var prompt = "wrong";
        }
        return generate_html(prompt, font_colour, 25);
    },
    choices: jsPsych.NO_KEYS,
    trial_duration: feedback_duration,
    data: { event: "feedback" },
    post_trial_gap: 500
}

var timeline = [];
timeline.push(prompt_digit);
timeline.push(number_sequence);
timeline.push(response);
timeline.push(feedback);

jsPsych.init({
    timeline: timeline,
    on_finish: function () {
        if (debug) {
            jsPsych.data.displayData();
        }
    },
});