var subject = jsPsych.randomization.randomID(15); // random character subject id
var condition = 'control'; // experiment/task condition

const trials = 2;               // the total number of trials 
var reps = 3;                  // the number of symbols per trial
const difficulty = 1;   // task difficult (1, 2, 3, 4, or 5; 5 is most difficult)

var symbol_duration = 200;      // each symbol appears for this duration (ms) 
var fixation_duration = 1000;  // fixation dduration
var itis = iti_exponential(low = 200, high = 500);  // generate array of ITIs

var n_dollars = 0;          // total number of dollar signs that have appeared thus far
var n_questions = 0;        // total number of question marks that have appeared thus far
var n_trial = -1; // current trial number counter
var n_rep = 0; // current rep counter
var n_dollar = 0;
var n_question = 0;

var switch_intensity = { 1: 2.4, 2: 2.2, 3: 1.8, 4: 1.5, 5: 1.3 } // task difficulty parameters

jsPsych.data.addProperties({
    subject: subject,
    condition: condition,
    browser: navigator.userAgent, // browser info
});

// function to determine switch reps on each trial
// returns an array of length reps, with integers (0, 1) indicating which symbol to present
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

var symbols = [ // define symbols
    { symbol: "<div style='font-size:80px;'>$</div>" },
    { symbol: "<div style='font-size:80px;'>?</div>" }
];

var fixation = { // define fixation
    type: "html-keyboard-response",
    stimulus: "<div style='font-size:30px;'>&#9679</div>", // dot as fixation
    choices: jsPsych.NO_KEYS,
    trial_duration: fixation_duration,
    data: {
        event: 'fixation',
    },
    on_finish: function (data) {
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
                n_question = jsPsych.data.get().filter({ stimulus: symbols[1]['symbol'], n_trial: n_trial }).count();
                data.n_question = n_question;
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

// TODO: replace with video-button-response.html
var feedback = {
    type: "html-keyboard-response",
    stimulus: function () {
        return "<p>$: " + n_dollar + "</p><p>?: " + n_question + "<p>Press any key to continue</p>";
    },
    data: { event: 'response' },
    on_finish: function (data) {
        data.n_rep = n_rep;
        data.n_trial = n_trial;
        data.n_dollar = n_dollar;
        data.n_question = n_question;
    }
};

var trial = { // events in a trial
    timeline: [fixation, symbols_sequence, feedback], // events in each trial
    repetitions: trials, // total number of trials to present
    post_trial_gap: random_choice(itis),
}; timeline.push(trial);

jsPsych.init({
    timeline: timeline,
    on_finish: function () {
        jsPsych.data.displayData();
    }
});