var subject = jsPsych.randomization.randomID(15); // random character subject id
var condition = 'control'; // experiment/task condition
var task = 'stroop';
var experiment = 'stroop';
var debug = true;
var no_incongruent_neighbors = true;
var show_feedback = true; // TODO: will explain this feature next time
var adaptive = true; // TODO: if true, adapt task difficulty (reduce rt_deadline if correct; increase rt_deadlline if wrong; by 50 ms)
var fullscreen = false;
var dark_background = true;

if (dark_background) {
    document.body.style.backgroundColor = "black";
    font_colour = "white";
} else if (!dark_background) {
    document.body.style.backgroundColor = "white";
    font_colour = "black";
};

var rt_deadline = 2000;
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
    subject: subject,
    condition: condition,
    task: task,
    experiment: experiment,
    adaptive: adaptive,
    browser: navigator.userAgent, // browser info
    datetime: Date(),
});

var timeline = [];

if (fullscreen) {
    timeline.push({
        type: "fullscreen",
        fullscreen_mode: true,
        message: generate_html("The experiment will switch to full screen mode when you press the button below", font_colour)
    });
}

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
            console.log("trial " + n_trial + "; text: " + text + "; color: " + color + "; " + trialtype + ' (correct key: ' + correct_key + ")"); // TODO: use your font function eventually....
        }
        text_html = generate_html(text, color, 50);
        return text_html;
    },
    trial_duration: function () { return rt_deadline; }, // function is needed to dynamically change value on each trial
    data: jsPsych.timelineVariable('data'),  // all data inside the 'data' attribute of our timeline variable (stimuli_shuffled) will be saved to the json file
    on_finish: function (data) {
        data.event = 'stimulus';
        data.key_press = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(data.key_press);
        data.n_trial = n_trial;
        data.rt_deadline = rt_deadline;
        var last_acc = jsPsych.data.get().select('acc').values[jsPsych.data.get().select('acc').values.length - 1];
        if (data.key_press == correct_key) {
            data.acc = 1;
        } else {
            data.acc = 0;
        };
        if (debug) {
            console.log("All accuracies for the trials as an array is: " + jsPsych.data.get().select('acc').values);
        }
        if (adaptive) {
            if ((last_acc + data.acc) == 2 && rt_deadline >= 250) {
                rt_deadline -= 50; // algorithm: reduce rt_deadline if last two trials' acc == 1 (i.e., sum of the last two trial's acc == 2), but make sure rt_deadline is never lower than 200
            } else if (data.acc == 0) {
                rt_deadline += 50; // increase rt_deadline by 50 ms if acc == 0
            };
            if (debug) {
                console.log("The sum of last two trials' acc is: " + (last_acc + data.acc).toString());
                console.log("The updated reaction time deadline is: " + rt_deadline);
            }
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
            if (debug) {
                console.log('There was an correct response');
            }
            var prompt = "correct, your reaction time was " + Math.round(last_trial_data.select('rt').values[0]) + " ms";
        } else {
            if (last_trial_data.select('key_press').values[0]) {
                if (debug) {
                    console.log('There was an incorrect response');
                }
                var prompt = "wrong";
            } else {
                if (debug) {
                    console.log('There was no response');
                }
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