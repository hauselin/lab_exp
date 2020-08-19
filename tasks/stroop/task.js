const taskinfo = {
    type: 'task', // 'task', 'survey', or 'study'
    uniquestudyid: 'stroop', // unique task id: must be IDENTICAL to directory name
    desc: 'stroop', // brief description of task
    condition: null, // experiment/task condition
    redirect_url: false // set to false if no redirection required
};

var info_ = create_info_(taskinfo);  // initialize subject id and task parameters
var datasummary_ = create_datasummary_(info_); // initialize datasummary object

const debug = true;  // debug mode to print messages to console and display json data at the end
const black_background = true; // if true, white text on black background
var font_colour = 'black';
if (black_background) {
    document.body.style.backgroundColor = "black";
    var font_colour = 'white';
}

const no_incongruent_neighbors = false;
var rt_deadline = 1500;
var fixation_duration = 300;
var feedback_duration = 1500;
var itis = iti_exponential(low = 300, high = 800);

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
    subject: info_.subject,
    type: taskinfo.type,
    uniquestudyid: taskinfo.uniquestudyid,
    desc: taskinfo.desc,
    condition: taskinfo.condition,
    info_: info_,
    datasummary_: datasummary_
});

// create experiment timeline
var timeline = [];
const html_path = "../../tasks/stroop/consent.html";
timeline = create_consent(timeline, html_path);

var instructions = {
    type: "instructions",
    pages: [
        generate_html("Welcome!", font_colour) + generate_html("Click next or press the right arrow key to proceed.", font_colour),
        generate_html("In this task, you'll have to select the correct font colour for each of the words shown.", font_colour) + generate_html("If you see red coloured text, press 'r'; if you see blue coloured text, press 'b'; if you see yellow coloured text, press 'y';", font_colour),
        generate_html("For example, you'll see:", font_colour) + generate_html("red", "red") + generate_html("And the correct response would be pressing 'r'.", font_colour),
        generate_html("You have a limited amount of time to respond to each prompted word, so react quickly!", font_colour),
        generate_html("Click next or press the right arrow key to begin.", font_colour)
    ],
    show_clickable_nav: true,
    show_page_number: true,
};
timeline.push(instructions);

var n_trial = 0; // stroop trial number counter

var fixation = {
    type: "image-keyboard-response",
    choices: jsPsych.NO_KEYS,
    stimulus: function () {
        if (dark_background) {
            return "../../tasks/stroop/fixation_black.png"
        } else {
            return "../../tasks/stroop/fixation_white.png"
        }
    },
    stimulus_height: 30,
    stimulus_width: 30,
    trial_duration: fixation_duration,
    data: { event: 'fixation' },
    on_finish: function (data) {
        data.n_trial = n_trial;
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
            console.log("trial " + n_trial + "; text: " + text + "; color: " + color + "; " + trialtype + ' (correct key: ' + correct_key + ")");
        }
        text_html = generate_html(text, color, 100);
        return text_html;
    },
    trial_duration: function () { return rt_deadline; }, // function is needed to dynamically change value on each trial
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
        if (debug) {
            console.log("Accuracies so far: " + jsPsych.data.get().filter({ "event": "stimulus" }).select('acc').values);
        }
        if (adaptive && n_trial > 0) {
            var previoustrials_acc = jsPsych.data.get().filter({ 'event': 'stimulus' }).last(2).select('acc').sum(); // get last two trials
            if (debug) {
                console.log("Previous trials' summed accuracy: " + previoustrials_acc);
            }
            if (previoustrials_acc > 1 && rt_deadline >= 250) {
                rt_deadline -= 50; // algorithm: reduce rt_deadline if last two trials' acc == 1 (i.e., sum of the last two trial's acc == 2), but make sure rt_deadline is never lower than 200
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

var feedback = { // if correct (acc > 0), "correct, 456 ms"; if wrong (acc < 1), "wrong, 600 ms"; if no response (rt === null && acc < 1), "respond faster"
    type: "html-keyboard-response",
    stimulus: function () {
        last_trial_data = jsPsych.data.getLastTrialData();
        if (last_trial_data.select('acc').values[0] > 0) {
            var prompt = "correct, your reaction time was " + Math.round(last_trial_data.select('rt').values[0]) + " ms";
        } else {
            if (last_trial_data.select('key_press').values[0]) {
                var prompt = "wrong";
            } else {
                var prompt = "respond faster";
            }
        }
        return generate_html(prompt, font_colour, 25);
    },
    choices: jsPsych.NO_KEYS,
    trial_duration: feedback_duration,
    data: { event: "feedback" },
    post_trial_gap: function () { return current_iti },  // present iti after one timeline/trial
}

var trial_sequence = {
    timeline: [fixation, stimulus, feedback], // one timeline/trial has these objects
    timeline_variables: stimuli_shuffled, // the above timeline/trial is repeated stimuli_shuffled.length times
};
timeline.push(trial_sequence);

jsPsych.init({
    timeline: timeline,
    on_finish: function () {
        var data_subset = jsPsych.data.get().filter({ "event": "stimulus" });  // select stroop trials
        var ddm_params = fit_ezddm_to_jspsych_data(data_subset);  // fit model
        if (debug) {
            console.log("ez-ddm parameters");
            console.log(ddm_params);
        }
        jsPsych.data.get().addToAll({ total_time: jsPsych.totalTime(), ddm_params: ddm_params });
        submit_data(jsPsych.data.get().json(), false);
        jsPsych.data.displayData();
    }
});