// DEFINE TASK (required)
const taskinfo = {
    type: 'task', // 'task', 'survey', or 'study'
    uniquestudyid: 'flanker', // unique task id: must be IDENTICAL to directory name
    desc: 'flanker task', // brief description of task
    condition: null, // experiment/task condition
    redirect_url: "/tasks/flanker/viz" // set to false if no redirection required
};

var info_ = create_info_(taskinfo);  // initialize subject id and task parameters

jsPsych.data.addProperties({
    subject: info_.subject,
    type: taskinfo.type,
    uniquestudyid: taskinfo.uniquestudyid,
    desc: taskinfo.desc,
    condition: taskinfo.condition,
});

// create experiment timeline
var timeline = [];

const debug = false;
var font_colour = "white";
var background_colour = "black";
set_colour(font_colour, background_colour);

// DEFINE TASK PARAMETERS (required)
var rt_deadline = 1500;
var feedback_duration = 1500;
var itis = iti_exponential(low = 300, high = 800);

var instructions = {
    type: "instructions",
    pages: [
        generate_html("Welcome!", font_colour, 25, [0, 0]) + generate_html("Click next or press the right arrow key to continue.", font_colour),
    ],
    show_clickable_nav: true,
    show_page_number: true,
};

var stimuli_unique = [  // unique flanker trials
    { data: { prompt: '>>>>>', answer: 'rightarrow', n_right: 4, n_left: 0, reps: 2 } },
    { data: { prompt: '<<<<<', answer: 'leftarrow', n_right: 0, n_left: 4, reps: 2 } },
];

var stimuli_repetitions = [];
stimuli_unique.forEach(function (item) {
    stimuli_repetitions.push(item.data.reps);})
var stimuli_shuffled = jsPsych.randomization.repeat(stimuli_unique, stimuli_repetitions);  // repeat and shuffle

var correct_key = '';
var current_iti = 0; // iti on each trial
var stimulus = {
    type: "html-keyboard-response",
    // choices: [37, 39],
    stimulus: function () {
        var prompt = jsPsych.timelineVariable('data', true).prompt;
        correct_key = jsPsych.timelineVariable('data', true).answer;
        text_html = generate_html(prompt, 100);
        return text_html;
    },
    trial_duration: function () { return rt_deadline; },
    data: jsPsych.timelineVariable('data'),
    on_finish: function (data) {
        data.key_press = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(data.key_press);
        if (data.key_press == correct_key) {
            data.acc = 1;
        } else {
            data.acc = 0;
        };
        current_iti = random_choice(itis);
    }
}

var feedback = {
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
    timeline: [stimulus, feedback], // one timeline/trial has these objects
    timeline_variables: stimuli_shuffled, // the above timeline/trial is repeated stimuli_shuffled.length times
};


timeline.push(instructions, trial_sequence);
jsPsych.init({
    timeline: timeline,
    on_finish: function() {
        jsPsych.data.displayData();
    }
});
