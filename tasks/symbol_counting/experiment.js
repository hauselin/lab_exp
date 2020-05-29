var trial_duration = 500;       // each trial is 500 ms
var symbol_duration = 500;      // each symbol appears for 500 ms
const trials = 3;               // the total number of trials 
var reps = 11;                  // the number of samples to draw
var total_dollars = 0;          // total number of dollar signs that have appeared thus far
var total_questions = 0;        // total number of question marks that have appeared thus far
var curr_trials = 0;            // current number of trials 

// var itis = iti_exponential();  // see instructions on Notion

var timeline = [];

var welcome = {
    type: "html-keyboard-response",
    stimulus: "Welcome to the experiment. Press any key to begin."
}; timeline.push(welcome);

var instructions = {
    type: "html-keyboard-response",
    stimulus: "<p>In this experiment, you will be presented with a sequence of " +
        "dollar signs ($) and question marks (?). You will need to keep a count of " +
        "each of the two types of symbols. There will be 3 trials in total. </p><p> Each symbol will be separated from " +
        "the next by a fixation cross in the middle of the screen. </p><p> Press any key " +
        "to begin. </p>"
}; timeline.push(instructions);

var test_stimuli = [
    { stimulus: "<div style='font-size:60px;'>$</div>" },
    { stimulus: "<div style='font-size:60px;'>?</div>" }
];

var fixation = {
    type: "html-keyboard-response",
    stimulus: "<div style='font-size:30px;'>+</div>",
    choices: jsPsych.NO_KEYS,
    trial_duration: trial_duration,
};

var test = {
    type: "html-keyboard-response",
    stimulus: jsPsych.timelineVariable('stimulus'),
    choices: jsPsych.NO_KEYS,
    trial_duration: symbol_duration,
};

var feedback = {
    type: "html-keyboard-response",
    stimulus: function () {
        var dollars = jsPsych.data.get().filter({ stimulus: "<div style='font-size:60px;'>$</div>" }).count() - total_dollars;
        var questions = jsPsych.data.get().filter({ stimulus: "<div style='font-size:60px;'>?</div>" }).count() - total_questions;

        total_dollars += dollars;
        total_questions += questions;

        return "<p> There were " + dollars + " dollar signs ($) and " + questions + " question marks (?). </p>" +
            "<p> Press any key to start the next trial. </p>";
    }
}; 

var final_feedback = {
    type: "html-keyboard-response",
    stimulus: function () {
        var dollars = jsPsych.data.get().filter({ stimulus: "<div style='font-size:60px;'>$</div>" }).count() - total_dollars;
        var questions = jsPsych.data.get().filter({ stimulus: "<div style='font-size:60px;'>?</div>" }).count() - total_questions;

        return "<p> There were " + dollars + " dollar signs ($) and " + questions + " question marks (?). </p>" +
            "<p> Press any key to end the experiment. </p>";
    }
}; 

while (curr_trials != trials) { // this produces new random samples of question marks and dollar signs each time
    curr_trials += 1;
    var test_procedure = { 
        timeline: [fixation, test],
        timeline_variables: jsPsych.randomization.sampleWithReplacement(test_stimuli, reps, 
            [Math.round(Math.random() * 10), Math.round(Math.random() * 10)])
    }; 
    timeline.push(test_procedure);
    if (curr_trials != trials) {
        timeline.push(feedback);
    } else {
        timeline.push(final_feedback); //  if the current number of trials == how many trials we want (3), display the final debrief block
    }
};

jsPsych.init({
    timeline: timeline,
    on_finish: function () {
        jsPsych.data.displayData();
    }
});