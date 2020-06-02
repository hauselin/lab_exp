var subject = jsPsych.randomization.randomID(15); // random character subject id
var condition = 'control'; // experiment/task condition
var task = 'symbol counter';
var experiment = 'symbol counter';

const trials = 2;               // the total number of trials 
var reps = 5;                  // the number of symbols per trial
const difficulty = 1;   // task difficult (1, 2, 3, 4, or 5; 5 is most difficult)
var show_performance = true;  // if true, also show subject counts on feedback page
var adaptive = false; // TODO: adaptive version not implemented yet

var symbol_duration = 500;      // each symbol appears for this duration (ms) 
var fixation_duration = 500;  // fixation dduration
var itis = iti_exponential(low = 200, high = 500);  // generate array of ITIs

// parameters below typically don't need to be changed
var n_trial = -1; // current trial number counter
var n_rep = 0; // current rep counter
var n_dollar = 0;
var n_hash = 0;
var choices = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
var responses = [];  // subject's response on each trial $ and #
var switch_intensity = { 1: 2.4, 2: 2.2, 3: 1.8, 4: 1.5, 5: 1.3 } // task difficulty parameters

// add data to all trials
jsPsych.data.addProperties({
    subject: subject,
    condition: condition,
    browser: navigator.userAgent, // browser info
    datetime: Date(),
});
var trial_duration = 500;       // each trial is 500 ms
var symbol_duration = 500;      // each symbol appears for 500 ms
const trials = 3;               // the total number of trials 
var reps = 11;                  // the number of samples to draw
var total_dollars = 0;          // total number of dollar signs that have appeared thus far
var total_questions = 0;        // total number of question marks that have appeared thus far
var curr_trials = 0;            // current number of trials 
//const utils = require('../../libraries/utils');

// function to determine switch reps on each trial; returns an array of length reps, with integers (0, 1) indicating which symbol to present
function determine_sequence(reps, symbols, trial_difficulty, verbose) {
    var switches = Math.floor(reps / switch_intensity[trial_difficulty]); // determine no. of switches
    var switch_trial_idx = range(1, reps - 1); // omit first and last reps (they never switch)
    // randomly pick four trial indices to switch ats 
    switch_trial_idx = jsPsych.randomization.shuffle(switch_trial_idx);
    switch_trial_idx = switch_trial_idx.slice(0, switches);
    n_symbols = range(0, symbols.length); // generate indices for each symbol
    // for loop to determine symbol on each rep 
    var sequence = [];
    for (i = 0; i < reps; i++) {
        if (i == 0) { // randomly determine first symbol
            n_symbol = random_choice(n_symbols);
            sequence.push(n_symbol);
        } else { // determine subsequent symbols
            if (switch_trial_idx.includes(i)) { // if switch, change symbol
                other_symbols = n_symbols.filter(function (x) {
                    return x != n_symbol;
                });
                n_symbol = random_choice(other_symbols);
            }
            sequence.push(n_symbol)
        }
    }
    if (verbose) {
        console.log(sequence);
    }
    return sequence;
}

var timeline = [];

// timeline.push({
//     type: "fullscreen",
//     fullscreen_mode: false
// });

var instructions = {
    type: "instructions",
    pages: ["Weclome!<p>Click next or press the right arrow key to proceed.</p>", "<p>In this task, you'll see sequences of " + "dollar signs ($) and hash/pound symbols (#). <p>Your goal is to keep a count of " + "each of the two types of symbols.</p>", "Click next or press the right arrow key to begin."],
    show_clickable_nav: true,
    show_page_number: true,
}; timeline.push(instructions);

var symbols = [ // define symbols
    { symbol: "<div style='font-size:80px;'>$</div>" },
    { symbol: "<div style='font-size:80px;'>#</div>" }
];

var fixation = { // define fixation
    type: "image-keyboard-response",
    // stimulus: "<div style='font-size:30px;'>&#9679</div>", // dot as fixation
    stimulus: "stimuli/fixation_white.png", // dot as fixation
    stimulus_height: 30,
    stimulus_width: 30,
    choices: jsPsych.NO_KEYS,
    trial_duration: fixation_duration,
    data: {
        event: 'fixation',
    },
    on_finish: function (data) {
        responses = [];
        n_rep = -1;  // reset symbol repeition counter
        n_trial += 1;
        data.n_trial = n_trial; // save current trial
    }
};

var symbols_sequence = { // determine sequence of symbols within a trial
    timeline: [
        {
            type: "html-keyboard-response",
            stimulus: jsPsych.timelineVariable("symbol"),
            choices: jsPsych.NO_KEYS,
            trial_duration: symbol_duration,
            post_trial_gap: 500,
            data: { event: 'symbol' },
            on_finish: function (data) {
                n_rep += 1;
                data.n_rep = n_rep;
                data.n_trial = n_trial;
                n_dollar = jsPsych.data.get().filter({ stimulus: symbols[0]['symbol'], n_trial: n_trial }).count();
                data.n_dollar = n_dollar;
                n_hash = jsPsych.data.get().filter({ stimulus: symbols[1]['symbol'], n_trial: n_trial }).count();
                data.n_hash = n_hash;
            }
        }
    ],
    timeline_variables: symbols,
    sample: { // custom sampling function to generate pseudorandom sequence of symbols on each trial
        type: 'custom',
        fn: function (samples) {
            samples = determine_sequence(reps, samples, difficulty, true);
            return samples;
        }
    },
};

var response = { // collect response from subject
    timeline: [
        {
            type: 'html-button-response',
            choices: choices,
            stimulus: jsPsych.timelineVariable('symbol')
        }
    ],
    timeline_variables: [
        { symbol: '<div style="transform: translateY(-30px); font-size:25px;"> How many $ symbols </div>' },
        { symbol: '<div style="transform: translateY(-30px); font-size:25px;"> How many # symbols </div>' }
    ],
    data: { event: "response" },
    on_finish: function (data) {
        // push last button press to responses array
        responses.push(parseInt(choices[parseInt(jsPsych.data.get().last(1).values()[0].button_pressed)]));
        console.log(responses);
        data.n_trial = n_trial;
    }
};

var feedback = { // show feedback to subject
    type: "html-button-response",
    stimulus: function () {
        text = "<p>Actual counts</p><p>" + n_dollar + " $ and " + n_hash + " #<p></p>";
        if (show_performance) {
            counts = "<p>Your counts</p><p>" + responses[0] + " $ and " + responses[1] + " #<p></p>";
            text = counts + text;
        }
        return "<div style='font-size:25px;'>" + text + "</div>";
    },
    choices: ['Continue'],
    data: { event: 'feedback' },
    on_finish: function (data) {
        data.n_rep = n_rep;
        data.n_trial = n_trial;
        data.n_dollar = n_dollar;
        data.n_hash = n_hash;
        data.n_dollar_response = responses[0];
        data.n_hash_response = responses[1];
        acc_dollar = + (n_dollar == responses[0]);
        acc_hash = + (n_hash == responses[1]);
        overall_acc = (acc_dollar + acc_hash) / 2;
        data.acc_dollar = acc_dollar;
        data.acc_hash = acc_hash;
        data.acc = overall_acc;
        if (adaptive) {
            // TODO: update task parameters/difficulty based on this trial's overall_acc
            if (overall_acc) {
                // do stuff
            } else {
                // do stuff
            }
        }
    }
};

var trial = { // events in a trial
    timeline: [fixation, symbols_sequence, response, feedback], // events in each trial
    repetitions: trials, // total number of trials to present
    post_trial_gap: random_choice(itis), // randomly select one ITI
}; timeline.push(trial);

jsPsych.init({
    timeline: timeline,
    on_finish: function () {
        jsPsych.data.displayData();
    }
});