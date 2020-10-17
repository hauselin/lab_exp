const taskinfo = {
    type: 'task', // 'task', 'survey', or 'study'
    uniquestudyid: 'stroop', // unique task id: must be IDENTICAL to directory name
    desc: 'stroop', // brief description of task
    condition: null, // experiment/task condition
    redirect_url: "/tasks/stroop/viz" // set to false if no redirection required
};

var info_ = create_info_(taskinfo);  // initialize subject id and task parameters

const debug = false;  // debug mode to print messages to console and display json data at the end
const black_background = true; // if true, white text on black background
var font_colour = 'black';
if (black_background) {
    document.body.style.backgroundColor = "black";
    var font_colour = 'white';
}

// TASK PARAMETERS
const adaptive = true;
const no_incongruent_neighbors = false;
var rt_deadline = 1500;
var fixation_duration = 300;
var feedback_duration = 1500;
var itis = iti_exponential(low = 300, high = 800);
var practice_trials = 3; // restriction: the actual number of practice trials will only be multiples of 3, hence it might be smaller than the number defined here.
if (practice_trials < 3) {
    practice_trials = 3;
}

// unique stroop trials
// reps: how many times to repeat that object/stimulus
// objects have the data field because that allows jsPsych to store all the data automatically
var stimuli_unique = [  // unique stroop trials
    { data: { text: 'red', color: 'red', trialtype: 'congruent', reps: 2 } },
    // { data: { text: 'green', color: 'green', trialtype: 'congruent', reps: 3 } },
    // { data: { text: 'yellow', color: 'yellow', trialtype: 'congruent', reps: 4 } },
    { data: { text: 'red', color: 'green', trialtype: 'incongruent', reps: 1 } },
    { data: { text: 'red', color: 'yellow', trialtype: 'incongruent', reps: 1 } },
    // { data: { text: 'green', color: 'red', trialtype: 'incongruent', reps: 1 } },
    // { data: { text: 'green', color: 'yellow', trialtype: 'incongruent', reps: 1 } },
    // { data: { text: 'yellow', color: 'red', trialtype: 'incongruent', reps: 1 } },
    // { data: { text: 'yellow', color: 'green', trialtype: 'incongruent', reps: 1 } },
    { data: { text: 'xxxx', color: 'red', trialtype: 'neutral', reps: 2 } },
    // { data: { text: 'xxxx', color: 'green', trialtype: 'neutral', reps: 2 } },
    // { data: { text: 'xxxx', color: 'yellow', trialtype: 'neutral', reps: 2 } }
]; // precondition: there must be at least 1 stimulus of each trialtype

var color_key = { 'red': 'r', 'green': 'g', 'yellow': 'y' }; // color-key mapping

// parameters below typically don't need to be changed
var stimuli_repetitions = [];
var practice_stimuli_congruent = [];
var practice_stimuli_incongruent = [];
var practice_stimuli_neutral = [];

// extract the value of the reps attribute in the stimuli_unique array
stimuli_unique.forEach(function (item) {
    stimuli_repetitions.push(item.data.reps);
    if (item.data.trialtype == 'congruent') {
        practice_stimuli_congruent.push(item);
    } else if (item.data.trialtype == 'incongruent') {
        practice_stimuli_incongruent.push(item);
    } else if (item.data.trialtype == 'neutral') {
        practice_stimuli_neutral.push(item);
    }
});
if (debug) {
    console.log(stimuli_repetitions);
    console.log('Practice trials per trial type:');
    console.log(practice_stimuli_congruent);
    console.log(practice_stimuli_incongruent);
    console.log(practice_stimuli_neutral);
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
if (debug) {
    console.log('Shuffled trials:');
    console.log(stimuli_shuffled);
}

// evenly add each type of trial to practice stimuli array
var practice_stimuli_shuffled = [];
for (i = 0; i < (Math.floor(practice_trials / 3)); i++) {
    if (practice_stimuli_congruent.length > i) {
        practice_stimuli_shuffled.push(practice_stimuli_congruent[i]);
    } else {
        practice_stimuli_shuffled.push(practice_stimuli_congruent[i % practice_stimuli_congruent.length]);
    }
    if (practice_stimuli_incongruent.length > i) {
        practice_stimuli_shuffled.push(practice_stimuli_incongruent[i]);
    } else {
        practice_stimuli_shuffled.push(practice_stimuli_incongruent[i % practice_stimuli_incongruent.length]);
    }
    if (practice_stimuli_neutral.length > i) {
        practice_stimuli_shuffled.push(practice_stimuli_neutral[i]);
    } else {
        practice_stimuli_shuffled.push(practice_stimuli_neutral[i % practice_stimuli_neutral.length]);
    }
}
if (debug) {
    console.log('Shuffled practice trials:');
    console.log(practice_stimuli_shuffled);
}

if (no_incongruent_neighbors) { // ensure incongruent stimuli aren't presented consecutively
    var practice_stimuli_shuffled = jsPsych.randomization.shuffleNoRepeats(practice_stimuli_shuffled, equality_test);
} else {
    jsPsych.randomization.shuffleNoRepeats(practice_stimuli_shuffled);  // shuffle
}

if (debug) { console.log(practice_stimuli_shuffled); }

// add data to all trials
jsPsych.data.addProperties({
    subject: info_.subject,
    type: taskinfo.type,
    uniquestudyid: taskinfo.uniquestudyid,
    desc: taskinfo.desc,
    condition: taskinfo.condition,
    info_: info_,
});

// create experiment timeline
var timeline = [];
var n_trial = 0; // stroop trial number counter
const html_path = "../../tasks/stroop/consent.html";
timeline = create_consent(timeline, html_path);

var instructions = {
    type: "instructions",
    pages: [
        generate_html("Welcome!", font_colour) + generate_html("Click next or press the right arrow key to proceed.", font_colour),
        generate_html("In this task, you'll have to select the correct font colour for each of the words shown.", font_colour) + generate_html("If you see red coloured text, press 'r'; if you see blue coloured text, press 'b'; if you see yellow coloured text, press 'y';", font_colour),
        generate_html("For example, you'll see:", font_colour) + generate_html("red", "red") + generate_html("And the correct response would be pressing 'r'.", font_colour),
        generate_html("You have a limited amount of time to respond to each prompted word, so react quickly!", font_colour),
        generate_html("Next up is a practice trial.", font_colour) + generate_html("Your data will NOT be recorded.", font_colour) + generate_html("Click next or press the right arrow key to begin.", font_colour)
    ],
    show_clickable_nav: true,
    show_page_number: true,
};

var instructions2 = {
    type: "instructions",
    pages: [
        generate_html("That was the practice trial.", font_colour) + generate_html("Click next or press the right arrow key to begin the experiment.", font_colour) + generate_html("Your data WILL be recorded this time.", font_colour)
    ],
    show_clickable_nav: true,
    show_page_number: false,
    on_finish: function () {
        n_trial = 0; // stroop trial number counter
    }
};


var fixation = {
    type: "image-keyboard-response",
    choices: jsPsych.NO_KEYS,
    stimulus: function () {
        if (black_background) {
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
    on_start: function () {
        stimulus_event = 'stimulus';
    },
    on_finish: function (data) {
        data.event = stimulus_event;
        data.key_press = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(data.key_press);
        data.n_trial = n_trial;
        if (debug) {
            console.log('rt: ' + data.rt);
        }
        data.rt_deadline = rt_deadline;
        if (data.key_press == correct_key) {
            data.acc = 1;
        } else {
            data.acc = 0;
        };
        if (debug) {
            console.log("The event of this trial is: " + stimulus_event);
            console.log("Accuracies so far: " + jsPsych.data.get().filterCustom(function (trial) { return trial.event == stimulus_event }).select('acc').values);
        }
        if (adaptive && n_trial > 0) {
            var previoustrials_acc = jsPsych.data.get().filterCustom(function (trial) { return trial.event == stimulus_event }).last(2).select('acc').sum(); // get last two trials
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

var practice_stimulus = jsPsych.utils.deepCopy(stimulus);
delete practice_stimulus.on_start;
practice_stimulus.on_start = function () {
    stimulus_event = "practice";
}

var practice_trial_sequence = {
    timeline: [fixation, practice_stimulus, feedback], // one timeline/trial has these objects
    timeline_variables: practice_stimuli_shuffled, // the above timeline/trial is repeated stimuli_shuffled.length times
};

// create task timeline
timeline.push(instructions, practice_trial_sequence, instructions2, trial_sequence);

jsPsych.init({
    timeline: timeline,
    on_finish: function () {
        document.body.style.backgroundColor = 'white';
        var datasummary = create_datasummary();
        info_.tasks_completed.push(info_.uniquestudyid); // add uniquestudyid to info_
        console.log(datasummary);
        jsPsych.data.get().addToAll({ // add objects to all trials
            info_: info_,
            datasummary: datasummary,
            total_time: datasummary.total_time,
        });
        if (debug) {
            jsPsych.data.displayData();
        }
        localStorage.setObj('info_', info_); // save to localStorage
        submit_data(jsPsych.data.get().json(), taskinfo.redirect_url);
    }
});

// functions to summarize data

// remove trials with too fast/slow RT
function preprocess_stroop() {  // 
    var data_sub = jsPsych.data.get().filter({ "event": "stimulus" });  // select stroop trials
    var data_sub = data_sub.filterCustom(function (trial) { return trial.rt > 100 });
    var cutoffs = mad_cutoffs(data_sub.select('rt').values);
    data_sub = data_sub.filterCustom(function (trial) { return trial.rt > cutoffs[0] }).filterCustom(function (trial) { return trial.rt < cutoffs[1] });
    return data_sub;
}

function create_datasummary() {
    var d = preprocess_stroop(); // preprocess/clean data
    var ddm_params = fit_ezddm_to_jspsych_data(d);  // calculate ddm parameters

    // select trials for each trialtype
    var congruent = d.filter({ "trialtype": "congruent" });  
    var incongruent = d.filter({ "trialtype": "incongruent" }); 
    var neutral = d.filter({ "trialtype": "neutral" }); 
    
    // median rt and mean acc
    var congruent_rt = congruent.select('rt').median();
    var congruent_acc = congruent.select('acc').mean();
    var incongruent_rt = incongruent.select('rt').median();
    var incongruent_acc = incongruent.select('acc').mean();
    var neutral_rt = neutral.select('rt').median();
    var neutral_acc = neutral.select('acc').mean();

    if (congruent_rt === undefined) {
        congruent_rt = null;
        congruent_acc = null;
    }
    if (incongruent_rt === undefined) {
        incongruent_rt = null;
        incongruent_acc = null;
    }
    if (neutral_rt === undefined) {
        neutral_rt = null;
        neutral_acc = null;
    }

    // store above info in array
    var datasummary = [
        { type: "congruent", param: "rt", value: congruent_rt },
        { type: "incongruent", param: "rt", value: incongruent_rt },
        { type: "neutral", param: "rt", value: neutral_rt },
        { type: "congruent", param: "acc", value: congruent_acc },
        { type: "incongruent", param: "acc", value: incongruent_acc },
        { type: "neutral", param: "acc", value: neutral_acc },
        { type: "interference", param: "rt", value: incongruent_rt - congruent_rt },
        { type: "interference", param: "acc", value: incongruent_acc - congruent_acc },
        { type: "ddm", param: "boundary", value: ddm_params.boundary },
        { type: "ddm", param: "nondecisiontime", value: ddm_params.nondecisiontime },
        { type: "ddm", param: "drift", value: ddm_params.drift },
    ];

    // add id/country information
    datasummary.forEach(function (s) {
        s.subject = info_.subject;
        s.time = info_.time;
        s.country_code = info_.country_code;
        s.country_name = info_.country_name;
    })

    return datasummary
}