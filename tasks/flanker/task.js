// DEFINE TASK (required)
const taskinfo = {
    type: 'task', // 'task', 'survey', or 'study'
    uniquestudyid: 'flanker', // unique task id: must be IDENTICAL to directory name
    desc: 'flanker task', // brief description of task
    condition: null, // experiment/task condition
    redirect_url: false // set to false if no redirection required
};

var info_ = create_info_(taskinfo);  // initialize subject id and task parameters

const debug = true;
var font_colour = "black";
var background_colour = "white";
set_colour(font_colour, background_colour);

// DEFINE TASK PARAMETERS (required)
const adaptive = true;
const no_incongruent_neighbors = true;
var rt_deadline = 1500;
var feedback_duration = 1500;
var itis = iti_exponential(low = 300, high = 800);
var n_trial = 0;  // trial counter
var practice_trials = 2;
if (practice_trials < 2) {
    practice_trials = 2;
}

jsPsych.data.addProperties({
    subject: info_.subject,
    type: taskinfo.type,
    uniquestudyid: taskinfo.uniquestudyid,
    desc: taskinfo.desc,
    condition: taskinfo.condition,
});

var instructions = {
    type: "instructions",
    pages: [
        generate_html("Welcome!", font_colour, 25, [0, 0]) + generate_html("Click next or press the right arrow key to continue.", font_colour),
    ],
    show_clickable_nav: true,
    show_page_number: true,
};

var stimuli_unique = [  // unique flanker trials
    { data: { stimulus: '>>>>>', answer: 'rightarrow', trialtype: "congruent", reps: 2 } },
    { data: { stimulus: '<<<<<', answer: 'leftarrow', trialtype: "congruent", reps: 2 } },
    { data: { stimulus: '<<><<', answer: 'rightarrow', trialtype: "incongruent", reps: 1 } },
    { data: { stimulus: '>><>>', answer: 'leftarrow', trialtype: "incongruent", reps: 1 } },
];

var stimuli_repetitions = [];
var practice_stimuli_congruent = [];
var practice_stimuli_incongruent = [];

// extract the value of the reps attribute in the stimuli_unique array
stimuli_unique.forEach(function (item) {
    stimuli_repetitions.push(item.data.reps);
    if (item.data.trialtype == 'congruent') {
        practice_stimuli_congruent.push(item);
    } else if (item.data.trialtype == 'incongruent') {
        practice_stimuli_incongruent.push(item);
    }
})
if (debug) {
    console.log(stimuli_repetitions);
    console.log('Practice trials per trial type:');
    console.log(practice_stimuli_congruent);
    console.log(practice_stimuli_incongruent);
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
for (i = 0; i < (Math.floor(practice_trials / 2)); i++) {
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

var correct_key = ''; // correct key on each trial
var current_iti = 0; // iti on each trial
var stimulus = {
    type: "html-keyboard-response",
    choices: [37, 39],
    stimulus: function () {
        var stimulus = jsPsych.timelineVariable('data', true).stimulus;
        correct_key = jsPsych.timelineVariable('data', true).answer;
        text_html = generate_html(stimulus, font_colour, 120);
        return text_html;
    },
    trial_duration: function () { return rt_deadline; },
    data: jsPsych.timelineVariable('data'),
    on_start: function () {
        stimulus_event = 'stimulus';
    },
    on_finish: function (data) {
        data.event = stimulus_event;
        data.key_press = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(data.key_press);
        data.n_trial = n_trial;
        data.n_right = jsPsych.timelineVariable('data', true).n_right;
        data.n_left = jsPsych.timelineVariable('data', true).n_left;
        if (data.key_press == correct_key) {
            data.acc = 1;
        } else {
            data.acc = 0;
        };
        n_trial += 1;
        current_iti = random_choice(itis);
        data.iti = current_iti;
    },
    post_trial_gap: function () { return current_iti }
}

var feedback = {
    type: "html-keyboard-response",
    stimulus: function () {
        last_trial_data = jsPsych.data.getLastTrialData();
        if (last_trial_data.select('acc').values[0] > 0) {
            var stimulus = "correct, your reaction time was " + Math.round(last_trial_data.select('rt').values[0]) + " ms";
        } else {
            if (last_trial_data.select('key_press').values[0]) {
                var stimulus = "wrong";
            } else {
                var stimulus = "respond faster";
            }
        }
        return generate_html(stimulus, font_colour, 25);
    },
    choices: jsPsych.NO_KEYS,
    trial_duration: feedback_duration,
    data: { event: "feedback" },
    post_trial_gap: 500
}

var trial_sequence = {
    timeline: [stimulus, feedback],
    timeline_variables: stimuli_shuffled,
};

var practice_stimulus = jsPsych.utils.deepCopy(stimulus);
delete practice_stimulus.on_start;
practice_stimulus.on_start = function () {
    stimulus_event = "practice";
}

var practice_trial_sequence = {
    timeline: [practice_stimulus, feedback], // one timeline/trial has these objects
    timeline_variables: practice_stimuli_shuffled, // the above timeline/trial is repeated stimuli_shuffled.length times
};

// create experiment timeline
var timeline = [];
const html_path = "../../tasks/flanker/consent.html";
timeline = create_consent(timeline, html_path);
timeline = check_same_different_person(timeline);
// timeline.push(instructions, trial_sequence);
timeline.push(instructions, practice_trial_sequence);
timeline = create_demographics(timeline);

// run experiment
jsPsych.init({
    timeline: timeline,
    on_finish: function () {
        document.body.style.backgroundColor = 'white';
        // var datasummary = create_datasummary();

        jsPsych.data.get().addToAll({
            total_time: jsPsych.totalTime() / 60000,
        });
        jsPsych.data.get().first(1).addToAll({
            info_: info_,
            // datasummary: datasummary,
        });
        if (debug) {
            jsPsych.data.displayData();
        }

        info_.tasks_completed.push(info_.uniquestudyid); // add uniquestudyid to info_
        info_.current_task_completed = 1;
        localStorage.setObj('info_', info_); // save to localStorage
        submit_data(jsPsych.data.get().json(), taskinfo.redirect_url);
    }
});