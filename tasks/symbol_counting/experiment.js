var symbol_duration = 800;      // each symbol appears for 500 ms
var fixation_duration = 1000;
const trials = 3;               // the total number of trials 
var reps = 4;                  // the number of symbols per trial
var total_dollars = 0;          // total number of dollar signs that have appeared thus far
var total_questions = 0;        // total number of question marks that have appeared thus far
var curr_trials = 0;            // current number of trials 
const difficulty = 1;   // task difficult (1, 2, 3, 4, or 5; 5 is most difficult)
var itis = iti_exponential(low = 400, high = 800);  // generate array of ITIs
var current_trial = 0;
var debug = false;

var switch_intensity = { 1: 2.4, 2: 2.2, 3: 1.8, 4: 1.5, 5: 1.3 } // task difficulty parameters

// function to determine switch reps on each trial
// returns an array of length reps, with integers (0, 1) indicating which symbol to present
function determine_sequence(reps, symbols, trial_difficulty) {
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
            current_symbol = random_choice(n_symbols);
            sequence.push(current_symbol);
        } else { // determine subsequent symbols
            if (switch_trial_idx.includes(i)) { // if switch, change symbol
                other_symbols = n_symbols.filter(function (x) {
                    return x != current_symbol;
                });
                current_symbol = random_choice(other_symbols);
            }
            sequence.push(current_symbol)
        }
    }
    return sequence;
}

var timeline = [];

// timeline.push({
//     type: "fullscreen",
//     fullscreen_mode: false
// });

// var welcome = {
//     type: "html-keyboard-response",
//     stimulus: "Welcome to the experiment. Press any key to begin."
// }; timeline.push(welcome);

// var instructions = {
//     type: "html-keyboard-response",
//     stimulus: "<p>In this experiment, you will be presented with a sequence of " +
//         "dollar signs ($) and question marks (?). <p>You will need to keep a count of " +
//         "each of the two types of symbols.</p>" +
//         "<p> Press any key to begin. </p> "
// }; timeline.push(instructions);

var symbols = [
    { symbol: "<div style='font-size:80px;'>$</div>" },
    { symbol: "<div style='font-size:80px;'>?</div>" }
];

var fixation = {
    // on_trial_start: console.log('New trial: ' + current_trial),
    type: "html-keyboard-response",
    stimulus: "<div style='font-size:30px;'>&#9679</div>", // dot as fixation
    choices: jsPsych.NO_KEYS,
    trial_duration: fixation_duration,
};

var symbols_sequence = {
    timeline: [
        {
            type: "html-keyboard-response",
            stimulus: jsPsych.timelineVariable("symbol"),
            choices: jsPsych.NO_KEYS,
            trial_duration: symbol_duration,
            post_trial_gap: 500,
        }
    ],
    timeline_variables: symbols,
    sample: { // custom sampling function to generate pseudorandom sequence of symbols on each trial
        type: 'custom',
        fn: function (samples) {
            samples = determine_sequence(reps, samples, difficulty);
            if (debug) {
                console.log(samples);
            }
            return samples;
        }
    }
};

// TODO: replace type with video-button-response.html
var feedback = {
    type: "html-keyboard-response",
    stimulus: function () {
        var dollars = jsPsych.data.get().filter({ stimulus: symbols[0]['symbol'] }).count() - total_dollars;
        var questions = jsPsych.data.get().filter({ stimulus: symbols[1]['symbol'] }).count() - total_questions;

        total_dollars += dollars;
        total_questions += questions;

        return "<p> There were " + dollars + " dollar signs ($) and " + questions + " question marks (?). </p>" +
            "<p> Press any key to continue. </p>";
    }
};

var trial = {
    on_trial_start: function() {
        if (debug) {
            console.log('New trial: ' + current_trial);
        }
    },
    timeline: [fixation, symbols_sequence, feedback], // events in each trial
    repetitions: trials, // total number of trials to present
    on_trial_finish: function () {
        current_trial += 1;
        total_dollars = 0;
        total_questions = 0;
        return current_trial;
    }
}; timeline.push(trial);

jsPsych.init({
    timeline: timeline,
    on_finish: function () {
        jsPsych.data.displayData();
    }
});