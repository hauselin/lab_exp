var timeline = [];

var welcome = {
    type: "html-keyboard-response",
    stimulus: "Welcome to the experiment. Press any key to begin."
}; timeline.push(welcome);

var instructions = {
    type: "html-keyboard-response",
    stimulus: "<p>In this experiment, you will be presented with a sequence of " +
        "dollar signs ($) and question marks (?). You will need to keep a count of " +
        "each of the two types of symbols. There will be 11 trials in total. </p><p> Each symbol will be separated from " +
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
    trial_duration: 500,
};

var test = {
    type: "html-keyboard-response",
    stimulus: jsPsych.timelineVariable('stimulus'),
    choices: jsPsych.NO_KEYS,
    trial_duration: 500,
};

var test_procedure = {
    timeline: [fixation, test],
    timeline_variables: test_stimuli,
    randomize_order: true,
    repetitions: 11
}; timeline.push(test_procedure);

var debrief_block = {
    type: "html-keyboard-response",
    stimulus: function () {
        var dollar_count = jsPsych.data.get().filter({ stimulus: "<div style='font-size:60px;'>$</div>" }).count();
        var question_count = jsPsych.data.get().filter({ stimulus: "<div style='font-size:60px;'>?</div>" }).count();

        return "<p> There were " + dollar_count + " dollar signs ($) and " + question_count + " question marks (?). </p>" +
            "<p> Press any key to end the experiment. </p>";
    }
}; timeline.push(debrief_block);

jsPsych.init({
    timeline: timeline,
    on_finish: function () {
        jsPsych.data.displayData();
    }
});