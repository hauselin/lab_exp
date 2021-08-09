const fullscreen = false;  // set to true for actual experiment
const debug = true;  // set to false for actual experiment
const local = true;  // set to false for actual experiment
let redirect_url = "https://www.bing.com";  // qualtrics url for surveys

if (local) {
    var CONDITION = 69;  // if local is false, variable will be set by cognition.run
}

// DOT MOTION TASK PARAMETERS
// practice trial parameters
// practice dot motion
var prac_dot_acc = 0.8; // required accuracy for the last 15 trials
var prac_dot_max = 80; // maximum practice trials before moving on
var prac_dot_rocket_duration = 1000; // duration of rocket during practice
var prac_dot_feedback_duration = 1000; // feedback duration
// practice rocket selection
var prac_rocket_max = 15; // maximum practice trials before moving on
var prac_rocket_deadline = 2000; // rt deadline for colour block practice trial
var prac_rocket_feedback_duration = 1000; // feedback duration
// practice pre-training / training
var practice_pre_training_repetitions = 10;  // no. of practice trials for pre-training (use 10 trials for experiemnt)
// practice update math
var prac_pattern_max = 10;  // no. of practice trials for pre-training (use 10 trials for experiemnt)

// pre_training block parameters
const pre_training_repetitions = 5; // use 40 for experiment

// post_training block parameters
const post_training_repetitions = 5; // use 20 for experiment

// dot motion task parameters
const dot_motion_repetitions = 3;
const dot_motion_deadline = 1500;
const p_incongruent_dots = 0.65;
const num_majority = 300;
var dot_motion_parameters;

// training block parameters
const num_reward_trials = 40;
const num_probe_trials = 20;
const feedback_duration = 1500;
const training_iti = 750;

// set background color
const font_colour = "white";
const background_colour = "black";
set_colour(font_colour, background_colour);

const instruct_fontsize = 21;
const rocket_selection_deadline = null; // ms
const cue_duration = 1500;

var rnorm = new Ziggurat(); // rnorm.nextGaussian() * 5 to generate random normal variable with mean 0 sd 5
var itis = iti_exponential(200, 700); // intervals between dot-motion reps

// reward/points for dot-motion task in training section
const min_reward = 230;
const max_reward = 370;
const mid_reward = 300;

// Overal trial number pretraining / training (don't edit it!)
var trial_number = 0;

let idx = CONDITION % assign.length;
if (idx == 0) {
    idx = 72;
}
console.log("CONDITION: ", CONDITION);
console.log("condition_idx: ", idx);
var assigned_info = assign.filter(i => i.condition_idx == idx)[0];
// randomly choose two rockets, two patterns
var two_rockets = jsPsych.randomization.sampleWithoutReplacement([
    'rocket01.jpg',
    'rocket02.jpg',
    'rocket03.jpg',
    'rocket04.jpg',
    'rocket05.jpg',
    'rocket06.jpg'
], 2);
var two_patterns = jsPsych.randomization.sampleWithoutReplacement([
    'pattern01.jpg',
    'pattern02.jpg',
    'pattern03.jpg',
    'pattern04.jpg',
    'pattern05.jpg',
    'pattern06.jpg'
], 2);
assigned_info.rocket_easy = two_rockets[0];
assigned_info.rocket_hard = two_rockets[1];
assigned_info.pattern_easy = two_patterns[0];
assigned_info.pattern_hard = two_patterns[1];
if (debug) {
    assigned_info.rocket_easy = 'rocket01.jpg';
    assigned_info.rocket_hard = 'rocket02.jpg';
    assigned_info.pattern_easy = 'pattern01.jpg';
    assigned_info.pattern_hard = 'pattern02.jpg';
}





// UPDATING/MATH TASK PARAMETERS
var num_to_update = null; // number to add to every digit
var n_digits = 3; // amount of numbers to show (must be > 1)
var n_distract_response = 3; // amount of distractors
var n_update_trial_pre_training = 40;  // 40 for actual experiment
var n_update_trial_post_training = 20;  // 20 for actual experiment
var n_practice_update_trial = 5; // number of practice trials and the amount of sequences to show
var duration_digit = 800; // how long to show each digit (ms)
var duration_post_digit = 500; // pause duration after each digit
var update_feedback_duration = 1500;
var update_response_deadline = 3000; // deadline for responding
var update_choice_deadline = null; // deadline for choosing hard or easy task
var n_hard_practice = 3; // number of hard trials for practice
var n_easy_practice = 3; // number of easy trials for practice

if (debug) {  // make task faster/easier for debugging
    update_response_deadline = 60000;  // RT deadline for update/math task
    duration_digit = 400; // how long to show each digit (ms)
    duration_post_digit = 200; // pause duration after each digit
    update_feedback_duration = 500;
}

// generate subject ID
var date = new Date()
var subject_id = jsPsych.randomization.randomID(4) + "-" + date.getTime();

// TODO also save url queries from prolific and cognition.run
jsPsych.data.addProperties({ // do not edit this section unnecessarily!
    condition: CONDITION,
    condition_idx: idx,
    subject_id: subject_id
});

// TODO construct url with prolific id etc.
redirect_url += ("?subject=" + subject_id);
redirect_url += ("&CONDITION=" + CONDITION);
redirect_url += ("&PROLIFIC_PID=123");

if (debug) {
    console.log("COUNTERBALANCING object");
    console.log(assigned_info);
    console.log("REDIRECT_URL");
    console.log(redirect_url);
};

// colours used for task, with left and right randomized for each experiment
const hex2txt = {};
for (i = 0; i < 4; i++) {
    hex2txt[assigned_info.colours_hex.split('-')[i]] = assigned_info.colours_name.split('-')[i];
}
var colours = Object.keys(hex2txt);
var colours_left = colours.slice(0, 2);
var colours_right = colours.slice(2, 4);

// initialize points object
var points = calculate_points_obj([]);

var images = {
    bg: "instruct_background.png",
    no_reward_feedback: "alien_noreward_feedback.png",
    no_reward: "alien_noreward.png",
    reward_feedback: "alien_reward_feedback.png",
    reward: "alien_reward.png",
    rocket_easy: assigned_info.rocket_easy, // easy
    rocket_hard: assigned_info.rocket_hard, // hard
    pattern_easy: assigned_info.pattern_easy, // easy
    pattern_hard: assigned_info.pattern_hard, // hard
};

for (const [key, value] of Object.entries(images)) {
    images[key] = "stimuli/" + value;
}

var instructions = {
    type: "instructions",
    pages: function () {
        let instructions = [
            instruct_browser,
            instruct_intro,
            instruct_mission1,
            instruct_mission2,
            instruct_colortask,
            instruct_colortask2,
        ];
        instructions = instructions.map((i) =>
            generate_html(i, font_colour, instruct_fontsize)
        );
        return instructions;
    },
    on_start: function () {
        document.body.style.backgroundImage =
            "url('stimuli/instruct_background.png')";
        document.body.style.backgroundSize = "cover";
    },
    on_finish: function () {
        document.body.style.backgroundImage = "";
    },
    show_clickable_nav: true,
    show_page_number: true,
};

var instruct_color = {
    type: "instructions",
    pages: function () {
        let instructions = [
            instruct_colors(colours, hex2txt),
            colors_remind(
                colours,
                "Try to memorize the colors associated with the left/right keys.<br><br>Next, you'll have the opportunity to practice identifying the colors of the stars. You'll automatically proceed to the next stage when you're performing well (at least 80% accurate). So always try your best to <span style='color:orange; font-weight:bold'>respond as accurately and quickly as possible</span>!<br><br>Remember to ignore the motion of the stars and focus on the colors! Distractor colors will often appear, so ignore them and focus on identifying the most predominant color."
            ),
        ];
        instructions = instructions.map((i) =>
            generate_html(i, font_colour, instruct_fontsize)
        );
        return instructions;
    },
    on_start: function () {
        document.body.style.backgroundImage =
            "url('stimuli/instruct_background.png')";
        document.body.style.backgroundSize = "cover";
    },
    on_finish: function () {
        document.body.style.backgroundImage = "";
    },
    show_clickable_nav: true,
    show_page_number: true,
};

var instruct_motion = {
    type: "instructions",
    pages: function () {
        let instructions = [instruct_motion1, instruct_motion2, instruct_motion3];
        instructions = instructions.map((i) =>
            generate_html(i, font_colour, instruct_fontsize)
        );
        return instructions;
    },
    on_start: function () {
        document.body.style.backgroundImage =
            "url('stimuli/instruct_background.png')";
        document.body.style.backgroundSize = "cover";
    },
    on_finish: function () {
        document.body.style.backgroundImage = "";
    },
    show_clickable_nav: true,
    show_page_number: true,
};

var instruct_practice_rocket_choose = {
    type: "instructions",
    pages: function () {
        let instructions = [instruct_prac_choose_rocket1];
        instructions = instructions.map((i) =>
            generate_html(i, font_colour, instruct_fontsize)
        );
        return instructions;
    },
    on_start: function () {
        document.body.style.backgroundImage =
            "url('stimuli/instruct_background.png')";
        document.body.style.backgroundSize = "cover";
    },
    on_finish: function () {
        document.body.style.backgroundImage = "";
    },
    show_clickable_nav: true,
    show_page_number: true,
};


var instruct_practice_rocket_choose_post = {
    type: "instructions",
    pages: function () {
        let instructions = [instruct_practice_rocket_choose_post1];
        instructions = instructions.map((i) =>
            generate_html(i, font_colour, instruct_fontsize)
        );
        return instructions;
    },
    on_start: function () {
        document.body.style.backgroundImage =
            "url('stimuli/instruct_background.png')";
        document.body.style.backgroundSize = "cover";
    },
    on_finish: function () {
        document.body.style.backgroundImage = "";
    },
    show_clickable_nav: true,
    show_page_number: true,
};

var instruct_practice_pre_training = {
    type: "instructions",
    pages: function () {
        let instructions = [instruct_practice_pre_training1, instruct_practice_pre_training2];
        instructions = instructions.map((i) =>
            generate_html(i, font_colour, instruct_fontsize)
        );
        return instructions;
    },
    on_start: function () {
        document.body.style.backgroundImage =
            "url('stimuli/instruct_background.png')";
        document.body.style.backgroundSize = "cover";
    },
    on_finish: function () {
        document.body.style.backgroundImage = "";
    },
    show_clickable_nav: true,
    show_page_number: true,
};

var instruct_pre_training = {
    type: "instructions",
    pages: function () {
        let instructions = [instruct_pre_training1, instruct_pre_training2];
        instructions = instructions.map((i) =>
            generate_html(i, font_colour, instruct_fontsize)
        );
        return instructions;
    },
    on_start: function () {
        document.body.style.backgroundImage =
            "url('stimuli/instruct_background.png')";
        document.body.style.backgroundSize = "cover";
    },
    on_finish: function () {
        document.body.style.backgroundImage = "";
    },
    show_clickable_nav: true,
    show_page_number: true,
};

var rocket_choices = [];
var random_rockets = jsPsych.randomization.shuffle([
    assigned_info.rocket_easy,
    assigned_info.rocket_hard,
]);
var rockets = {
    type: "html-keyboard-response",
    stimulus: function () {
        random_rockets = jsPsych.randomization.shuffle([
            assigned_info.rocket_easy,
            assigned_info.rocket_hard,
        ]);
        return `<div>
        <div style='float: left; padding-right: 10px'><img src='stimuli/${random_rockets[0]}' width='233'></img></div>
        <div style='float: right; padding-left: 10px'><img src='stimuli/${random_rockets[1]}' width='233'></img></div>
        </div>`;
    },
    choices: [37, 39],
    trial_duration: rocket_selection_deadline,
    on_finish: function (data) {
        data.block = check_block(is_pre_training, is_training, is_post_training, is_practice);
        if (data.key_press == 37) {
            data.rocket = random_rockets[0];
        } else {
            data.rocket = random_rockets[1];
        }
        rocket_choices.push(data.rocket);
        data.event = "rockets";
        data.trial_number = trial_number;
        if (debug) {
            console.log("Trial number:", trial_number);
        }
    },
    post_trial_gap: 0
};

var rocket_chosen = {
    type: "html-keyboard-response",
    stimulus: "",
    on_start: function (trial) {
        var key_press = jsPsych.data.get().last(1).values()[0].key_press;
        if (key_press == 37) {
            trial.stimulus = get_rocket_remaining("left", random_rockets);
        } else if (key_press == 39) {
            trial.stimulus = get_rocket_remaining("right", random_rockets);
        } else {
            trial.stimulus = "Respond faster";
        }
    },
    choices: [],
    trial_duration: 500,
    on_finish: function (data) {
        data.block = check_block(is_pre_training, is_training, is_post_training, is_practice);
        if (
            rocket_choices[rocket_choices.length - 1] == assigned_info.rocket_easy
        ) {
            dot_motion_parameters = dot_motion_trial_variable(false);
        } else {
            dot_motion_parameters = dot_motion_trial_variable(true);
        }
        data.event = "rocket_chosen";
        data.trial_number = trial_number;
        if (debug) {
            console.log("Trial number:", trial_number);
        }
    },
};

var pre_training_rt = [];
var training_points = [];
var is_pre_training;
var is_training;
var is_post_training;
var is_practice;
var practice_pre_training_accuracy = [];

var dot_motion = {
    type: "rdk",
    on_start: function () {
        if (
            rocket_choices[rocket_choices.length - 1] == assigned_info.rocket_easy
        ) {
            dot_motion_parameters = dot_motion_trial_variable(false);
        } else {
            dot_motion_parameters = dot_motion_trial_variable(true);
        }
    },
    background_color: background_colour,
    choices: [37, 39],
    trial_duration: function () {
        if (is_training) {
            // subject-specific RT deadline for training block
            let training_deadline = mad_cutoffs(pre_training_rt, 1.0)[1] + 150;
            if (isNaN(training_deadline)) training_deadline = dot_motion_deadline;
            if (debug) {
                console.log(training_deadline);
            }
            return training_deadline;
        }
        return dot_motion_deadline;  // same RT deadline for all other blocks
    },
    coherence: function () {
        return [
            dot_motion_parameters.majority_coherence,
            dot_motion_parameters.distractor_coherence,
        ];
    },
    coherent_direction: function () {
        return dot_motion_parameters.coherent_direction;
    },
    dot_color: function () {
        return [
            dot_motion_parameters.majority_col,
            dot_motion_parameters.distractor_col,
        ];
    },
    correct_choice: function () {
        return [dot_motion_parameters.correct_choice];
    },
    move_distance: 9,
    number_of_apertures: 2,
    dot_radius: 2.5, // dot size (default 2)
    number_of_dots: function () {
        return [
            dot_motion_parameters.num_majority,
            dot_motion_parameters.num_distractors,
        ];
    },
    RDK_type: 3,
    aperture_width: 610,
    aperture_center_x: [window.innerWidth / 2, window.innerWidth / 2],
    aperture_center_y: [window.innerHeight / 2, window.innerHeight / 2],
    on_finish: function (data) {
        data.block = check_block(is_pre_training, is_training, is_post_training, is_practice);
        var current_points = 0;
        if (data.correct) {  // correct response
            if (assigned_info.reward_condition == 'performance') {
                current_points = calculate_points(data.rt, points);
            } else if (assigned_info.reward_condition == 'neutral') {
                current_points = mid_reward;
            } else if (assigned_info.reward_condition == 'effort') {
                if (rocket_choices[rocket_choices.length - 1] == assigned_info.rocket_easy) {
                    current_points = min_reward;
                } else if (rocket_choices[rocket_choices.length - 1] == assigned_info.rocket_hard) {
                    current_points = max_reward;
                } else {
                    current_points = null;
                }
            } else {
                current_points = null;
            }
            if (is_pre_training) {
                if (!is_practice) {
                    pre_training_rt.push(data.rt);
                    if (debug) {
                        console.log("Pre-training rt added:", data.rt);
                    }
                } else {
                    practice_pre_training_accuracy.push(1);
                    console.log('PRACTICE accuracies: ', practice_pre_training_accuracy);
                }
            } else if (is_training) {
                training_points.push(current_points);
                if (debug) {
                    console.log("Training rt added:", data.rt);
                }
            }
            if (debug) {
                console.log("CORRECT");
            }
        } else {  // wrong response
            practice_pre_training_accuracy.push(0);
            if (is_training) {
                training_points.push(current_points);
            }
            if (debug) {
                console.log("WRONG");
            }
        }
        data.congruent = dot_motion_parameters.congruent;
        data.points = current_points;
        data.event = "dot_motion";
        data.trial_number = trial_number;
        if (debug) {
            console.log("Trial number:", trial_number);
            console.log("Current points:", current_points);
        }
    },
    post_trial_gap: function () {
        return random_choice(itis);
    },
};
// FIXME: weird that scrollbar shows up during dotmotion rep (see https://github.com/jspsych/jsPsych/discussions/787) (problem doesn't show up on cognition.run)

// generate 1 dot motion trial
function dot_motion_trial_variable(is_hard) {
    // select two random colours and assign them to answer and distractor
    var selected_colours = jsPsych.randomization.sampleWithoutReplacement(
        colours,
        2
    );
    var majority_col = selected_colours[0];
    var distractor_col = selected_colours[1];

    // store answers and their respective dot motion properties into object
    var trial_variable = {
        majority_col: majority_col,
        distractor_col: distractor_col,
        num_majority: num_majority,
        num_distractors: Math.floor(Math.random() * (50 - 20 + 1)) + 20,
        majority_coherence: Math.random() * (1 - 0.75) + 0.75,
        distractor_coherence: Math.random() * (1 - 0.75) + 0.75,
    };

    // evaluate motion direction
    if (p_incongruent_dots < Math.random()) {
        // if incongruent
        if (colours_left.includes(majority_col)) {
            // if answer is a left colour
            trial_variable.coherent_direction = [0, 180]; // majority dots move right
        } else {
            // if answer is a right colour
            trial_variable.coherent_direction = [180, 0]; // majority dots move left
        }
        trial_variable.congruent = false;
    } else {
        // if congruent
        if (colours_left.includes(majority_col)) {
            // if answer is a left colour
            trial_variable.coherent_direction = [180, 0]; // majority dots move left
        } else {
            // if answer is a right colour
            trial_variable.coherent_direction = [0, 180]; // majority dots move right
        }
        trial_variable.congruent = true;
    }

    // evaluate correct choice
    if (is_hard) {
        // if task is hard
        if (colours_left.includes(majority_col)) {
            trial_variable.correct_choice = 37; // correct answer is left arrow
        } else {
            trial_variable.correct_choice = 39; // correct answer is right arrow
        }
    } else {
        // if task is easy
        if (trial_variable.coherent_direction[0] == 0) {
            // if majority's coherent direction is right
            trial_variable.correct_choice = 39; // correct answer is right arrow
        } else {
            trial_variable.correct_choice = 37;
        }
    }

    if (debug) {
        console.log(selected_colours);
        console.log(trial_variable.correct_choice);
    }
    return trial_variable;
}

var dot_motion_trials = {
    timeline: [dot_motion],
    repetitions: dot_motion_repetitions,
};

var pre_training_feedback = {
    type: "html-keyboard-response",
    choices: [],
    trial_duration: feedback_duration,
    stimulus: function () {
        last3 = practice_pre_training_accuracy.slice(-3);
        practice_pre_training_accuracy = [];
        console.log("PRACTICE accuracies (feedback): ", last3);
        const acc = mean(last3).toFixed(2) * 100;
        return generate_html(
            acc + "% correct",
            font_colour,
            55,
            [0, -21]
        );
    },
    on_finish: function (data) {
        practice_pre_training_accuracy = [];
        data.block = check_block(is_pre_training, is_training, is_post_training, is_practice);
        if (debug) {
            console.log("Trial number:", trial_number);
        }
    },
};

var pre_training = {
    timeline: [rockets, rocket_chosen, dot_motion_trials],
    on_start: function () {
        trial_number++;
        is_pre_training = true;
        is_post_training = false;
        is_training = false;
        is_practice = false;
    },
    repetitions: pre_training_repetitions,
};

var training_index = 0;
var cue = {
    type: "image-keyboard-response",
    stimulus: "",
    stimulus_height: window.innerHeight / 2,
    maintain_aspect_ratio: true,
    on_start: function () {
        var trial_timeline_variable = training_timeline_variables[training_index];
        if (is_practice) {
            trial_timeline_variable =
                prac_training_timeline_variables[prac_training_index];
        }
        console.log("TRIAL NUM =", trial_number + 1);
        document.body.style.backgroundImage =
            "url(" + trial_timeline_variable.cue_image + ")";
        document.body.style.backgroundSize = "cover";
        if (debug) {
            console.log("Training index:", training_index);
        }
    },
    choices: [],
    on_finish: function (data) {
        data.block = check_block(is_pre_training, is_training, is_post_training, is_practice);
        var trial_timeline_variable = training_timeline_variables[training_index];
        if (is_practice) {
            trial_timeline_variable =
                prac_training_timeline_variables[prac_training_index];
        }
        document.body.style.backgroundImage = "";
        data.cue_type = trial_timeline_variable.trial_type;
        data.event = "training_cue";
        data.trial_number = trial_number + 1;
        if (debug) {
            console.log("Trial number:", trial_number + 1);
        }
    },
    trial_duration: cue_duration,
};
// BUG potentially? cues sometimes are shown for longer than cue_duration? hmm...

var training_timeline_variables = get_training_timeline_variables(
    num_reward_trials,
    num_probe_trials,
    false
);

var feedback = {
    type: "html-keyboard-response",
    choices: [],
    trial_duration: feedback_duration,
    stimulus: function () {
        var trial_timeline_variable = training_timeline_variables[training_index];
        if (is_practice) {
            trial_timeline_variable =
                prac_training_timeline_variables[prac_training_index];
        }
        if (trial_timeline_variable.trial_type == "reward") {
            let point_scored =
                mean(training_points.slice(training_points.length - 3));
            if (point_scored <= 0) {
                point_scored = 0;
            } else {
                for (let i = 0; i < 3; i++) {
                    point_scored += (rnorm.nextGaussian() * 5)
                }
            };
            if (point_scored <= 0) point_scored = 0;
            return generate_html(
                Math.round(point_scored),
                font_colour,
                89,
                [0, -200]
            );
        } else {
            return "";
        }
    },
    on_start: function () {
        var trial_timeline_variable = training_timeline_variables[training_index];
        if (is_practice) {
            trial_timeline_variable =
                prac_training_timeline_variables[prac_training_index];
        }
        document.body.style.backgroundImage =
            "url(" + trial_timeline_variable.feedback_image + ")";
        document.body.style.backgroundSize = "cover";
    },
    on_finish: function (data) {
        data.block = check_block(is_pre_training, is_training, is_post_training, is_practice);
        var trial_timeline_variable = training_timeline_variables[training_index];
        if (is_practice) {
            trial_timeline_variable =
                prac_training_timeline_variables[prac_training_index];
            prac_training_index++;
        } else {
            training_index++;
        }
        document.body.style.backgroundImage = "";
        data.cue_type = trial_timeline_variable.trial_type;
        data.mean_points = mean(training_points.slice(training_points.length - 3));
        data.event = "training_feedback";
        data.trial_number = trial_number;
        if (debug) {
            console.log("Trial number:", trial_number);
        }
    },
};

var instruct_training = {
    type: "instructions",
    pages: function () {
        let instructions = [instruct_training1, instruct_training2, instruct_training3];
        instructions = instructions.map((i) =>
            generate_html(i, font_colour, instruct_fontsize)
        );
        return instructions;
    },
    on_start: function () {
        document.body.style.backgroundImage =
            "url('stimuli/instruct_background.png')";
        document.body.style.backgroundSize = "cover";
    },
    on_finish: function () {
        document.body.style.backgroundImage = "";
    },
    show_clickable_nav: true,
    show_page_number: true,
    post_trial_gap: 1500,
};


var training = {
    timeline: [cue, rockets, rocket_chosen, dot_motion_trials, feedback],
    on_start: function () {
        // does it once during the timeline at the first trial that does not have on_start
        trial_number++;
        is_training = true;
        is_pre_training = false;
        is_post_training = false;
        is_practice = false;
        console.log("compute points obj again");
        points = calculate_points_obj(pre_training_rt);
        training_points = [];
    },
    post_trial_gap: training_iti,
    timeline_variables: training_timeline_variables,
};

var practice_hard_dot_accuracies = [];
var practice_hard_dot_prompt = {
    type: "html-keyboard-response",
    stimulus: `
      <div><img src='${images.rocket_hard}' width='233'></img></div>
    `,
    on_finish: function () {
        dot_motion_parameters = dot_motion_trial_variable(true);
    },
    choices: [],
    trial_duration: prac_dot_rocket_duration,
};

var practice_hard_dot = jsPsych.utils.deepCopy(dot_motion);
practice_hard_dot.on_start = function () {
    dot_motion_parameters = dot_motion_trial_variable(true);
};
practice_hard_dot.on_finish = function (data) {
    if (data.correct) {
        practice_hard_dot_accuracies.push(1);
    } else {
        practice_hard_dot_accuracies.push(0);
    }
    data.event = "practice_hard_dot";
};

var practice_dot_feedback = {
    type: "html-keyboard-response",
    stimulus: function () {
        if (debug) {
            console.log("Hard dot accuracies:", practice_hard_dot_accuracies);
            console.log("Easy dot accuracies:", practice_easy_dot_accuracies);
        }
        if (JSON.parse(jsPsych.data.getLastTrialData().json())[0].correct) {
            return generate_html("correct", font_colour, 34);
            // + "Your reaction time was " +
            // Math.round(JSON.parse(jsPsych.data.getLastTrialData().json())[0].rt) +
            // "ms"
        } else {
            return generate_html("wrong", font_colour, 34);
        }
    },
    trial_duration: prac_dot_feedback_duration,
};
var practice_hard_dot_trials = {
    timeline: [
        practice_hard_dot_prompt,
        practice_hard_dot,
        practice_dot_feedback,
    ],
    repetitions: prac_dot_max,
    conditional_function: function () {
        var repeat_colour_practice = true;
        if (practice_hard_dot_accuracies.length > 10) {
            if (practice_hard_dot_accuracies.length <= 15) {
                if (mean(practice_hard_dot_accuracies) > prac_dot_acc) {
                    repeat_colour_practice = false;
                }
            } else if (
                mean(
                    practice_hard_dot_accuracies.slice(
                        practice_hard_dot_accuracies.length - 15
                    )
                ) > prac_dot_acc
            ) {
                repeat_colour_practice = false;
            }
        }
        return repeat_colour_practice;
    },
};

var practice_easy_dot_accuracies = [];
var practice_easy_dot_prompt = {
    type: "html-keyboard-response",
    stimulus: `
      <div><img src='${images.rocket_easy}' width='233'></img></div>
    `,
    on_finish: function () {
        dot_motion_parameters = dot_motion_trial_variable(false);
    },
    choices: [],
    trial_duration: prac_dot_rocket_duration,
};

var practice_easy_dot = jsPsych.utils.deepCopy(dot_motion);
practice_easy_dot.on_start = function () {
    dot_motion_parameters = dot_motion_trial_variable(false);
};
practice_easy_dot.on_finish = function (data) {
    if (data.correct) {
        practice_easy_dot_accuracies.push(1);
    } else {
        practice_easy_dot_accuracies.push(0);
    }
    data.event = "practice_easy_dot";
};

var practice_easy_dot_trials = {
    timeline: [
        practice_easy_dot_prompt,
        practice_easy_dot,
        practice_dot_feedback,
    ],
    repetitions: prac_dot_max,
    conditional_function: function () {
        var repeat_colour_practice = true;
        if (practice_easy_dot_accuracies.length > 10) {
            if (practice_easy_dot_accuracies.length <= 15) {
                if (mean(practice_easy_dot_accuracies) > prac_dot_acc) {
                    repeat_colour_practice = false;
                }
            } else if (
                mean(
                    practice_easy_dot_accuracies.slice(
                        practice_easy_dot_accuracies.length - 15
                    )
                ) > prac_dot_acc
            ) {
                repeat_colour_practice = false;
            }
        }
        return repeat_colour_practice;
    },
};

var practice_rocket_prompt = jsPsych.randomization.sampleWithoutReplacement(
    ["color", "motion"],
    1
)[0];
var practice_rocket = {
    type: "html-keyboard-response",
    stimulus: function () {
        random_rockets = jsPsych.randomization.shuffle([
            assigned_info.rocket_easy,
            assigned_info.rocket_hard,
        ]);
        const txt = `Which rocket is associated with <span style='color:orange; font-weight:bold'>identifying the ${practice_rocket_prompt}</span> of the stars?<br><br>Respond by pressing the left/right key for the left/right rocket, respectively.<br><br>
        <div>
        <div style='float: left; padding-right: 11px'><img src='stimuli/${random_rockets[0]}' width='233'></img></div>
        <div style='float: right; padding-left: 10px'><img src='stimuli/${random_rockets[1]}' width='233'></img></div>
        </div>`;
        return generate_html(txt, font_colour, instruct_fontsize)
    },
    choices: function () {
        var choices_arr;
        if (practice_rocket_prompt == "motion") {
            if (random_rockets[0] == assigned_info.rocket_easy) {
                choices_arr = [37];
            } else {
                choices_arr = [39];
            }
        } else {
            if (random_rockets[0] == assigned_info.rocket_hard) {
                choices_arr = [37];
            } else {
                choices_arr = [39];
            }
        }
        return choices_arr;
    },
    trial_duration: null,
    post_trial_gap: 300,
    on_finish: function (data) {
        data.event = "practice_rocket";
        practice_rocket_prompt = jsPsych.randomization.sampleWithoutReplacement(
            ["color", "motion"],
            1
        )[0];
    },
};

var practice_rocket_trials = {
    timeline: [practice_rocket],
    repetitions: prac_rocket_max,
};

var practice_rocket_trials_post = {
    timeline: [practice_rocket],
    repetitions: Math.floor(prac_rocket_max / 2),
};

var instruct_alien_introduction = {
    type: "instructions",
    pages: function () {
        let instructions = [instruct_alien_introduction1, instruct_alien_introduction2, instruct_alien_introduction3];
        instructions = instructions.map((i) =>
            generate_html(i, font_colour, instruct_fontsize)
        );
        return instructions;
    },
    on_start: function () {
        document.body.style.backgroundImage =
            "url('stimuli/instruct_background.png')";
        document.body.style.backgroundSize = "cover";
    },
    on_finish: function () {
        document.body.style.backgroundImage = "";
    },
    show_clickable_nav: true,
    show_page_number: true,
};

var alien_introduction = {
    timeline: [
        {
            type: "html-keyboard-response",
            stimulus: generate_html("This is a landed spaceship.<br><br>It means <span style='color:orange; font-weight:bold'>you can earn rewards</span> from the alien for completing the star color-motion task.<br><br>Press the right arrow key to proceed.", font_colour, 21, [0, -144]),
            on_start: function () {
                document.body.style.backgroundImage = "url(" + images.reward + ")";
                document.body.style.backgroundSize = "cover";
            },
            choices: [39]
        },
        {
            type: "html-keyboard-response",
            stimulus: generate_html("This spaceship has not landed.<br><br>It means <span style='color:orange; font-weight:bold'>you cannot earn rewards</span> from the alien for completing the star color-motion task.<br><br>Press the right arrow key to proceed.", font_colour, 21, [0, -144]),
            on_start: function () {
                document.body.style.backgroundImage = "url(" + images.no_reward + ")";
                document.body.style.backgroundSize = "cover";
            },
            on_finish: function () {
                document.body.style.backgroundImage = "";
            },
            choices: [39]
        },
    ],
};

var instruct_alien_rewards = {
    type: "instructions",
    pages: function () {
        let instructions = [instruct_alien_rewards1, instruct_alien_rewards2, instruct_alien_rewards3, instruct_alien_rewards4];
        instructions = instructions.map((i) =>
            generate_html(i, font_colour, instruct_fontsize)
        );
        return instructions;
    },
    on_start: function () {
        document.body.style.backgroundImage =
            "url('stimuli/instruct_background.png')";
        document.body.style.backgroundSize = "cover";
    },
    on_finish: function () {
        document.body.style.backgroundImage = "";
    },
    show_clickable_nav: true,
    show_page_number: true,
};

var practice_pre_training = jsPsych.utils.deepCopy(pre_training);
practice_pre_training.on_start = function () {
    trial_number++;
    is_pre_training = true;
    is_post_training = false;
    is_training = false;
    is_practice = true;
};
practice_pre_training.repetitions = practice_pre_training_repetitions;
practice_pre_training.timeline.push(pre_training_feedback)  // provide feedback during pre-training practice

var mixed_training_timeline_variables = [
    {
        trial_type: "reward",
        cue_image: "stimuli/alien_reward.png",
        feedback_image: "stimuli/alien_reward_feedback.png",
    },
    {
        trial_type: "probe",
        cue_image: "stimuli/alien_noreward.png",
        feedback_image: "stimuli/alien_noreward_feedback.png",
    },
];
var prac_reward_training_timeline_variables = Array(5).fill(
    mixed_training_timeline_variables[0]
);
var prac_noreward_training_timeline_variables = Array(5).fill(
    mixed_training_timeline_variables[1]
);
var prac_mixed_training_timeline_variables = [];
for (i = 0; i < 4; i++) {
    prac_mixed_training_timeline_variables.push(
        ...mixed_training_timeline_variables
    );
}
var prac_training_timeline_variables = [
    prac_reward_training_timeline_variables,
    prac_noreward_training_timeline_variables,
    prac_mixed_training_timeline_variables,
].flat();

var prac_training_index = 0;
var practice_training = jsPsych.utils.deepCopy(training);
practice_training.on_start = function () {
    // does it once during the timeline at the first trial that does not have on_start
    trial_number++;
    is_training = true;
    is_pre_training = false;
    is_post_training = false;
    is_practice = true;
    points = calculate_points_obj(pre_training_rt);
};
practice_training.timeline_variables = prac_training_timeline_variables;




























// keycode for responses
var choices = [
    { keycode: 37, response: "left" },
    { keycode: 39, response: "right" },
];
if (n_distract_response == 3) {
    choices = choices.concat([
        { keycode: 38, response: "up" },
        { keycode: 40, response: "down" },
    ]); // 3 distractors + 1 correct
}

var update_instructions1 = {
    type: "instructions",
    pages: [
        generate_html("Welcome!", font_colour) +
        generate_html(
            "Click next or press the right arrow key to proceed.",
            font_colour
        ),
        generate_html(
            "You have a limited amount of time to see each number, so react quickly!",
            font_colour
        ),
        generate_html("Next up is a practice trial.", font_colour) +
        generate_html("Your data will NOT be recorded.", font_colour) +
        generate_html(
            "Click next or press the right arrow key to begin.",
            font_colour
        ),
    ],
    show_clickable_nav: true,
    show_page_number: true,
};

var update_instructions2 = {
    type: "instructions",
    pages: [
        generate_html("That was the practice trial.", font_colour) +
        generate_html(
            "Click next or press the right arrow key to begin the experiment.",
            font_colour
        ) +
        generate_html("Your data WILL be recorded this time.", font_colour),
    ],
    show_clickable_nav: true,
    show_page_number: false,
};

var number_options = [3, 4];
var hard_num = random_choice(number_options);
var is_hard_left;


var hard_option = {
    type: "html-keyboard-response",
    stimulus: function () {
        hard_num = random_choice(number_options);
        num_to_update = hard_num;
        return `<div style='float: center;'><img src='stimuli/${assigned_info.pattern_hard}' width='233'></img></div>`;
    }
}

var easy_option = {
    type: "html-keyboard-response",
    stimulus: function () {
        num_to_update = 0;
        return `<div style='float: center;'><img src='stimuli/${assigned_info.pattern_easy}' width='233'></img></div>`;
    }
}

var options = {
    type: "html-keyboard-response",
    stimulus: function () {
        hard_num = random_choice(number_options);
        if (Math.random() < 0.5) {
            is_hard_left = true;
            return `<div>
            <div style='float: left; padding-right: 10px'><img src='stimuli/${assigned_info.pattern_hard}' width='233'></img></div>
            <div style='float: right; padding-left: 10px'><img src='stimuli/${assigned_info.pattern_easy}' width='233'></img></div>
            </div>`;
        } else {
            is_hard_left = false;
            return `<div>
            <div style='float: left; padding-right: 10px'><img src='stimuli/${assigned_info.pattern_easy}' width='233'></img></div>
            <div style='float: right; padding-left: 10px'><img src='stimuli/${assigned_info.pattern_hard}' width='233'></img></div>
            </div>`;
        }
    },
    choices: [37, 39],
    trial_duration: update_choice_deadline,
    data: { event: "update_choices" },
    post_trial_gap: 500,
    on_finish: function (data) {
        data.block = check_block(is_pre_training, is_training, is_post_training, is_practice);
        if (data.key_press == 37) {
            // pressed left
            if (is_hard_left) {
                num_to_update = hard_num;
            } else {
                num_to_update = 0;
            }
        } else if (data.key_press == 39) {
            // pressed right
            if (is_hard_left) {
                num_to_update = 0;
            } else {
                num_to_update = hard_num;
            }
        } else {
            // no response
            num_to_update = null;
        }
        data.choice = num_to_update;
        data.hard_choice = hard_num;
        if (data.choice == data.hard_choice) {
            data.percent_hard = 1;
        } else {
            data.percent_hard = 0;
        }
    },
};

var prompt_digit = {
    type: "html-keyboard-response",
    stimulus: function () {
        var remind = update_prompt(num_to_update) + " to each digit";
        remind = generate_html(remind, font_colour, 30);
        return remind;
    },
    choices: [],
    trial_duration: 400,
    data: { event: "digit_prompt" },
    post_trial_gap: 600,
};

var temp_digits = [];
var number_sequence = {
    timeline: [
        {
            type: "html-keyboard-response",
            stimulus: function () {
                var remind = update_prompt(num_to_update);
                remind = generate_html(remind, font_colour, 30, [0, -50]) + "<br>";
                var d = generate_html(
                    jsPsych.timelineVariable("digit", true),
                    font_colour,
                    80,
                    [0, -50]
                );
                return remind + d;
            },
            choices: [],
            trial_duration: duration_digit,
            data: { event: "digit" },
            post_trial_gap: duration_post_digit,
            on_finish: function (data) {
                data.block = check_block(is_pre_training, is_training, is_post_training, is_practice);
                data.digit = jsPsych.timelineVariable("digit", true);
                temp_digits.push(data.digit);
            },
        },
    ],
    timeline_variables: Array.from(range(0, 10), (x) => Object({ digit: x })),
    sample: {
        // pick different n_digits to present on each trial/sequence
        type: "with-replacement",
        size: n_digits,
    },
};

var choices_shuffle;
var update_response = {
    type: "html-keyboard-response",
    stimulus: function () {
        choices_shuffle = process_choices(choices);
        prompt_html =
            generate_html(choices_shuffle[0].prompt, font_colour, 30, [-100, 50]) +
            generate_html(choices_shuffle[1].prompt, font_colour, 30, [100, 2]);
        if (n_distract_response == 3) {
            prompt_html = prompt_html.concat(
                generate_html(choices_shuffle[2].prompt, font_colour, 30, [0, -100]) +
                generate_html(choices_shuffle[3].prompt, font_colour, 30, [0, -35])
            );
        }
        if (debug) {
            console.log(choices_shuffle);
            console.log(choices_shuffle.filter((x) => x.correct)[0].prompt);
        }
        return prompt_html;
    },
    choices: choices.map((x) => x.keycode),
    trial_duration: update_response_deadline,
    data: { event: "update_response" },
    post_trial_gap: 500,
    on_finish: function (data) {
        data.block = check_block(is_pre_training, is_training, is_post_training, is_practice);
        var chosen = choices_shuffle.filter((x) => x.keycode == data.key_press)[0];
        data.num_to_update = num_to_update;
        if (!chosen) {
            // no response
            data.acc = null;
            data.response = null;
        } else {
            // response made
            data.response = chosen.response;
            if (chosen.correct) {
                data.acc = 1;
            } else {
                data.acc = 0;
            }
        }
        temp_digits = []; // clear digit sequences for next trial
    },
};

var update_feedback = {
    type: "html-keyboard-response",
    stimulus: function () {
        last_trial_data = jsPsych.data.getLastTrialData();
        last_trial_value = last_trial_data.select("acc").values[0];
        if (last_trial_value > 0) {
            var prompt = "correct";
            // "correct, your reaction time was " +
            // Math.round(last_trial_data.select("rt").values[0]) +
            // " ms";
        } else if (last_trial_value === null) {
            var prompt = "respond faster";
        } else {
            var prompt = "wrong";
        }
        return generate_html(prompt, font_colour, 34);
    },
    choices: [],
    trial_duration: feedback_duration,
    data: { event: "update_feedback" },
    post_trial_gap: 500,
};

var update_math_sequence_pre_training = {
    timeline: [
        options,
        prompt_digit,
        number_sequence,
        update_response,
        update_feedback,
    ],
    repetitions: n_update_trial_pre_training,
};

var update_math_sequence_post_training = jsPsych.utils.deepCopy(update_math_sequence_pre_training);
update_math_sequence_post_training.repetitions = n_update_trial_post_training;

var practice_hard_update = {
    timeline: [
        hard_option,
        prompt_digit,
        number_sequence,
        update_response,
        update_feedback,
    ],
    repetitions: n_hard_practice,
}

var practice_easy_update = {
    timeline: [
        easy_option,
        prompt_digit,
        number_sequence,
        update_response,
        update_feedback,
    ],
    repetitions: n_easy_practice,
}

var practice_sequence = jsPsych.utils.deepCopy(update_math_sequence_pre_training);
practice_sequence.repetitions = n_practice_update_trial;
for (i = 0; i < practice_sequence.timeline.length; i++) {
    practice_sequence.timeline[i].data = { event: "update_practice" };
}


var instruct_post_training = {
    type: "instructions",
    pages: function () {
        let instructions = [
            instruct_post_training1,
            instruct_post_training2,
        ];
        instructions = instructions.map((i) =>
            generate_html(i, font_colour, instruct_fontsize)
        );
        return instructions;
    },
    on_start: function () {
        document.body.style.backgroundImage =
            "url('stimuli/instruct_background.png')";
        document.body.style.backgroundSize = "cover";
    },
    on_finish: function () {
        document.body.style.backgroundImage = "";
    },
    show_clickable_nav: true,
    show_page_number: true,
};


var post_training = jsPsych.utils.deepCopy(pre_training);
post_training.on_start = function () {
    trial_number++;
    is_pre_training = false;
    is_post_training = true;
    is_training = false;
    is_practice = false;
};
post_training.repetitions = post_training_repetitions;

var practice_pattern_prompt = jsPsych.randomization.sampleWithoutReplacement(
    ["hard", "easy"],
    1
)[0];
var practice_pattern = {
    type: "html-keyboard-response",
    stimulus: function () {
        random_patterns = jsPsych.randomization.shuffle([
            assigned_info.pattern_easy,
            assigned_info.pattern_hard,
        ]);
        return `Choose the rocket associated to the <b>${practice_pattern_prompt}</b> task
        <div>
        <div style='float: left; padding-right: 10px'><img src='stimuli/${random_patterns[0]}' width='233'></img></div>
        <div style='float: right; padding-left: 10px'><img src='stimuli/${random_patterns[1]}' width='233'></img></div>
        </div>
    `;
    },
    choices: function () {
        var choices_arr;
        if (practice_pattern_prompt == "easy") {
            if (random_patterns[0] == assigned_info.pattern_easy) {
                choices_arr = [37];
            } else {
                choices_arr = [39];
            }
        } else {
            if (random_patterns[0] == assigned_info.pattern_hard) {
                choices_arr = [37];
            } else {
                choices_arr = [39];
            }
        }
        return choices_arr;
    },
    trial_duration: null,
    post_trial_gap: 300,
    on_finish: function (data) {
        data.event = "practice_pattern";
        practice_pattern_prompt = jsPsych.randomization.sampleWithoutReplacement(
            ["easy", "hard"],
            1
        )[0];
    },
};

var practice_pattern_trials = {
    timeline: [practice_pattern],
    repetitions: prac_pattern_max,
};




var instruct_finish = {
    type: "instructions",
    pages: function () {
        let instructions = [
            instruct_finish1,
            // [`The final part of this study requires you to complete a brief survey.<br><br>If you are not redirectedly automatically to the survey URL, visit the following URL:<br><br><span style='color:orange; font-weight:bold'>${redirect_url}</span>`]
        ];
        instructions = instructions.map((i) =>
            generate_html(i, font_colour, instruct_fontsize)
        );
        return instructions;
    },
    on_start: function () {
        document.body.style.backgroundImage =
            "url('stimuli/instruct_background.png')";
        document.body.style.backgroundSize = "cover";
    },
    on_finish: function () {
        document.body.style.backgroundImage = "";
    },
    show_clickable_nav: true,
    show_page_number: true,
};



var redirect_trial = {
	type: 'html-keyboard-response',
    stimulus: function () {
        const txt = `The final part of the study requires you to complete a brief survey.<br><br>Click <a href="${redirect_url}" target="_blank" style="color:orange; font-weight:bold">here</a> to open and complete the survey in a new browser tab.`;
        return generate_html(txt, font_colour, instruct_fontsize)
    },
	choices: [39]
}















// CREATE EXPERIMENT TIMELINE
var timeline = [];
if (fullscreen) timeline.push({ type: 'fullscreen', fullscreen_mode: true });

// TODO counterbalance the two tasks: create separate arrays first then use timeline = timeline.concat(x) to concatenate arrays
// SECTION: PRE-TRAINING
// MOTION TASK
// PRACTICE COLOR/HARD motion task
// timeline.push(instructions);
// timeline.push(instruct_color);
// timeline.push(practice_hard_dot_trials);

// PRACTICE MOTION/EASY motion task
// timeline.push(instruct_motion);
// timeline.push(practice_easy_dot_trials);

// PRACTICE CHOOSING easy/hard motion task
// timeline.push(instruct_practice_rocket_choose)
// timeline.push(practice_rocket_trials);

// PRACTICE motion task - demand selection
// timeline.push(instruct_practice_pre_training);
// timeline.push(practice_pre_training);

// ACTUAL PRE-TRAINING - motion task - demand selection
// timeline.push(instruct_pre_training);
// timeline.push(pre_training);

// MATH TASK
// PRE-TRAINING - math task

// SECTION: TRAINING (rewards delivered with alien cues)
// PRACTICE: introduce reward cues
// timeline.push(instruct_alien_introduction)
// timeline.push(alien_introduction);
// timeline.push(instruct_alien_rewards)
// timeline.push(practice_training);

// ACTUAL TRAINING (dot-motion task)
// timeline.push(instruct_training)
// timeline.push(training);

// POST-TRAINING
// timeline.push(instruct_post_training)

// MOTION TASK
// timeline.push(instruct_practice_rocket_choose_post); 
// timeline.push(practice_rocket_trials_post); // practice/remind cues
// timeline.push(instruct_pre_training);
// timeline.push(post_training);

// FINISH
timeline.push(instruct_finish)
timeline.push(redirect_trial)


if (false) {
    // PRACTICE UPDATING TASK
    timeline.push(practice_pattern_trials);
    timeline.push(practice_hard_update);
    timeline.push(practice_easy_update);
    timeline.push(update_instructions1, practice_sequence, update_instructions2); // remove feedback for actual task
    
    // PRE-TRAINING
    if (assigned_info.pretrain_order == 'dotmotion-update') {
        timeline.push(pre_training);
        timeline.push(update_math_sequence_pre_training);
    } else {
        // timeline.push(pre_training);
        timeline.push(update_math_sequence_pre_training);
    }

    // POST-TRAINING
    if (assigned_info.posttrain_order == 'dotmotion-update') {
        // timeline.push(post_training);
        timeline.push(update_math_sequence_post_training);
    } else {
        timeline.push(update_math_sequence_post_training);
        // timeline.push(post_training);
    }
}


// don't allow safari
var is_Safari = navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome');
if (is_Safari) {
	timeline = [{
		type: 'instructions', allow_backward: false, button_label_next: '', show_clickable_nav: false, allow_keys: false,
		pages: ["You might be using an incompatible web browser.<br><br>Please switch to <strong>Google Chrome</strong> or <strong>Firefox</strong> for a better experience."],
	}];
}

jsPsych.init({
    timeline: timeline,
    preload_images: Object.values(images),
    on_finish: function () {
        if (debug) jsPsych.data.displayData();
        if (!debug && redirect_url) window.location = redirect_url;
    },
});