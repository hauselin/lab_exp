var subject = jsPsych.randomization.randomID(15); // random character subject id
var condition = 'control'; // experiment/task condition
var task = 'stroop';
var experiment = 'stroop';
var debug = true;
var no_incongruent_neighbors = true;
var show_feedback = true; // TODO: will explain this feature next time
var adaptive = true; // TODO: if true, adapt task difficulty (reduce rt_deadline if correct; increase rt_deadlline if wrong; by 50 ms)
var fullscreen = false;

// TODO: make background black, instructions white

var rt_deadline = 1000;
var fixation_duration = 300;
var feedback_duration = 750;
var itis = iti_exponential(low = 300, high = 700);

// unique stroop trials
// reps: how many times to repeat that object/stimulus
// objects have the data field because that allows jsPsych to store all the data automatically
var stimuli_unique = [  // unique stroop trials
    { data: { text: 'red', color: 'red', trialtype: 'congruent', reps: 2 } },
    { data: { text: 'green', color: 'green', trialtype: 'congruent', reps: 3 } },
    { data: { text: 'yellow', color: 'yellow', trialtype: 'congruent', reps: 4 } },
    { data: { text: 'red', color: 'green', trialtype: 'incongruent', reps: 1 } },
    { data: { text: 'red', color: 'yellow', trialtype: 'incongruent', reps: 1 } },
    { data: { text: 'green', color: 'red', trialtype: 'incongruent', reps: 1 } },
    { data: { text: 'green', color: 'yellow', trialtype: 'incongruent', reps: 1 } },
    { data: { text: 'yellow', color: 'red', trialtype: 'incongruent', reps: 1 } },
    { data: { text: 'yellow', color: 'green', trialtype: 'incongruent', reps: 1 } },
    { data: { text: 'xxxx', color: 'red', trialtype: 'neutral', reps: 2 } },
    { data: { text: 'xxxx', color: 'green', trialtype: 'neutral', reps: 2 } },
    { data: { text: 'xxxx', color: 'yellow', trialtype: 'neutral', reps: 2 } }
];

var color_key = { 'red': 'r', 'green': 'g', 'yellow': 'y' }; // color-key mapping

// parameters below typically don't need to be changed
var stimuli_repetitions = [];
// extract the value of the reps attribute in the stimuli_unique array
for (i = 0; i < stimuli_unique.length; i++) {
    stimuli_repetitions.push(stimuli_unique[i].data.reps);
}
if (debug) {
    console.log(stimuli_repetitions);
}

// repeat each stimulus reps times
var stimuli_shuffled = jsPsych.randomization.repeat(stimuli_unique, stimuli_repetitions);  // repeat and shuffle
if (no_incongruent_neighbors) { // ensure incongruent stimuli aren't presented consecutively
    function equality_test(a, b) {
        if (a.trialtype != 'incongruent') {
            return false;  // ignore if it's not incongruent trialtype
        } else {
            return a.trialtype === b.trialtype;  // return true if neighbors are both incongruent
        }
    }
    var stimuli_shuffled = jsPsych.randomization.shuffleNoRepeats(stimuli_shuffled, equality_test);
}
if (debug) { console.log(stimuli_shuffled); }

// add data to all trials
jsPsych.data.addProperties({
    subject: subject,
    condition: condition,
    task: task,
    experiment: experiment,
    browser: navigator.userAgent, // browser info
    datetime: Date(),
});

// TODO: add fullscreen

var timeline = [];

var instructions = {};  // TODO add welcome page and other pages for task instructions (then add to trial_sequence timeline)

var n_trial = 0; // stroop trial number counter

var fixation = {
    type: "html-keyboard-response",
    choices: jsPsych.NO_KEYS,
    stimulus: "+", // TODO show the fixation image instead (see symbol counting task; image-keyboard-response)
    trial_duration: fixation_duration,
    data: { event: 'fixation' },
    on_finish: function (data) {
        data.n_trial = 0;
    },
};

var correct_key = ''; // correct key on each trial
var current_iti = 0; // iti on each trial
var stimulus = {
    type: "html-keyboard-response",
    choices: Object.values(color_key), // get all the values (drop the keys) in the object color_key
    stimulus: function () {
        var text = jsPsych.timelineVariable('data', true).text;  // e.g., stimulus_shuffled[i].data.text
        var color = jsPsych.timelineVariable('data', true).color; // e.g., stimulus_shuffled[i].data.color 
        var trialtype = jsPsych.timelineVariable('data', true).trialtype;  // e.g., stimulus_shuffled[i].data.trialtype
        correct_key = color_key[color];
        if (debug) {
            console.log("trial " + n_trial + "; text: " + text + "; color: " + color + "; " + trialtype + ' (correct key: ' + correct_key + ")"); // TODO: use your font function eventually....
        }
        text_html = "<font style='color:" + color + "'>" + text + "</font>"; // TODO: make font size bigger 
        return text_html;
    },
    trial_duration: function () { return rt_deadline; },
    data: jsPsych.timelineVariable('data'),  // all data inside the 'data' attribute of our timeline variable (stimuli_shuffled) will be saved to the json file
    on_finish: function (data) {
        data.event = 'stimulus';
        data.key_press = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(data.key_press);
        data.n_trial = n_trial;
        data.rt_deadline = rt_deadline;
        if (data.key_press == correct_key) {
            data.acc = 1;
        } else {
            data.acc = 0;
        };
        if (adaptive) {
            if (data.acc == 1) {
                rt_deadline -= 50; // TODO: algorithm: reduce rt_deadline if last two trials' acc == 1 (i.e., sum of the last two trial's acc == 2), but make sure rt_deadline is never lower than 200
            } else if (data.acc == 0) {
                rt_deadline += 50; // increase rt_deadline by 50 ms if acc == 0
            };
        }
        if (debug) {
            console.log("response: " + data.key_press + "; acc: " + data.acc + "; next trial rt_deadline: " + rt_deadline);
        };
        n_trial += 1;
        current_iti = random_choice(itis);  // select an iti for this trial (to be presented later)
        data.iti = current_iti; // save iti in data
    },
}

var feedback = { // TODO: if correct (acc > 0), "correct, 456 ms"; if wrong (acc < 1), "wrong, 600 ms"; if no response (rt === null && acc < 1), "respond faster"
    type: "html-keyboard-response",
    stimulus: function () {
        return 'show feedback';
    },
    choices: jsPsych.NO_KEYS,
    trial_duration: feedback_duration,
    data: { event: "feedback" },
}

var trial_sequence = {
    timeline: [fixation, stimulus, feedback], // one timeline/trial has these objects
    timeline_variables: stimuli_shuffled, // the above timeline/trial is repeated stimuli_shuffled.length times
    post_trial_gap: current_iti,  // present iti after one timeline/trial
};
timeline.push(trial_sequence);

jsPsych.init({
    timeline: timeline,
    on_finish: function () {
        jsPsych.data.addProperties({ total_time: jsPsych.totalTime() });
        // $.ajax({
        //     type: "POST",
        //     url: "/submit-data",
        //     data: jsPsych.data.get().json(),
        //     contentType: "application/json"
        // })
        jsPsych.data.displayData();
    }
});