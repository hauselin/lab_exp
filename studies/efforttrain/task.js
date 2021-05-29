var font_colour = "white";
var background_colour = "black";
set_colour(font_colour, background_colour);

var debug = true;

const instruct_fontsize = 21;
const rocket_selection_deadline = null; // ms
const cue_duration = 1500;

var rnorm = new Ziggurat();  // rnorm.nextGaussian() * 5 to generate random normal variable with mean 0 sd 5
var itis = iti_exponential(200, 700);  // intervals between dot-motion reps


// practice trial parameters
// practice dot motion
var prac_dot_acc = 0.8; // required accuracy for the last 15 trials
var prac_dot_max = 80; // maximum practice trials before moving on
var prac_dot_deadline = 15000; // rt deadline for dot practice trial
var prac_dot_feedback_duration = 2000; // feedback duration
// practice rocket selection
var prac_rocket_max = 10; // maximum practice trials before moving on
var prac_rocket_deadline = 15000; // rt deadline for colour block practice trial
var prac_rocket_feedback_duration = 1000 // feedback duration
// practice pre-training / training
var practice_pre_training_repetitions = 3;

// pre_training block parameters
const pre_training_repetitions = 5;

// dot motion task parameters
const dot_motion_repetitions = 3;
const dot_motion_deadline = 15000;
const p_incongruent_dots = 0.65;
const num_majority = 300;
var dot_motion_parameters;

// training block parameters
const num_reward_trials = 40;
const num_probe_trials = 20;
const feedback_duration = 1500;

// Overal trial number pretraining / training (don't change)
var trial_number = 0;

// colours used for task, with left and right randomized for each experiment
// TODO orange and red might be too similar?!? (green/blue too??)
var colours = ['#D00000', '#FF9505', '#6DA34D', '#3772FF'];
var colours = jsPsych.randomization.repeat(colours, 1);
var colours_left = colours.slice(2, 4)
var colours_right = colours.slice(0, 2)

// initialize points object
var points = calculate_points_obj([]);

var subject_id = 1;
var assigned_info = assign.filter(i => i.subject == subject_id)[0];


var images = {
    bg: 'instruct_background.png',
    no_reward_feedback: 'alien_noreward_feedback.png',
    no_reward: 'alien_noreward.png',
    reward_feedback: 'alien_reward_feedback.png',
    reward: 'alien_reward.png',
    rocket1: assigned_info.rocket1,
    rocket2: assigned_info.rocket2,
    pattern1: assigned_info.pattern1,
    pattern2: assigned_info.pattern2
};

for (const [key, value] of Object.entries(images)) {
    images[key] = "stimuli/" + value;
}

var instructions = {
    type: "instructions",
    pages: function () {
        let instructions = [instruct_browser, instruct_intro, instruct_mission1, instruct_mission2, instruct_colortask, instruct_colortask2];
        instructions = instructions.map(i => generate_html(i, font_colour, instruct_fontsize));
        return instructions;
    },
    on_start: function () {
        document.body.style.backgroundImage = "url('stimuli/instruct_background.png')";
        document.body.style.backgroundSize = "cover";
    },
    on_finish: function () {
        document.body.style.backgroundImage = '';
    },
    show_clickable_nav: true,
    show_page_number: true,
};

// FIXME: left arrows are bigger and misaligned on chrome/safari (but okay on firefox)?
// FIXME: fix distance between left/right arrows
var colour_blocks = {
    type: "html-keyboard-response",
    stimulus: generate_html(instruct_colors, font_colour, instruct_fontsize) + `
    <div style='width: 100px; float:left; padding-right: 21px;'>
        <div style='color: ${colours_left[0]}; font-size:987%; margin-bottom: 55px; width: 100px; height: 100px; position: relative;'>&lArr;</div>
        <div style='color: ${colours_left[1]}; font-size:987%; width: 100px; height: 100px; position: relative'>&lArr;</div>
    </div>
    <div style='width: 100px; float:right; padding-left: 21px;'>
        <div style='color: ${colours_right[0]}; font-size:987%; margin-bottom: 55px; width: 100px; height: 100px; position: relative;'>&rArr;</div>
        <div style='color: ${colours_right[1]}; font-size:987%; width: 100px; height: 100px; position: relative'>&rArr;</div>
    </div>
  `
}

// TODO: make rockets randomly swap places.
var rocket_choices = [];
var random_rockets = jsPsych.randomization.shuffle([assigned_info.rocket1, assigned_info.rocket2]);
// console.log(random_rockets);
var rockets = {
    type: "html-keyboard-response",
    stimulus: function () {
        random_rockets = jsPsych.randomization.shuffle([assigned_info.rocket1, assigned_info.rocket2]);
        return `<div>
        <div style='float: left; padding-right: 10px'><img src='stimuli/${random_rockets[0]}' width='233'></img></div>
        <div style='float: right; padding-left: 10px'><img src='stimuli/${random_rockets[1]}' width='233'></img></div>
        </div>`
    },
    choices: [37, 39],
    trial_duration: rocket_selection_deadline,
    on_finish: function (data) {
        if (data.key_press == 37) {
            data.rocket = random_rockets[0]
        } else {
            data.rocket = random_rockets[1]
        }
        rocket_choices.push(data.rocket);
        data.event = 'rockets';
        data.trial_number = trial_number;
        if (debug) {
            console.log('Trial number:', trial_number);
        }
    }
};

function get_rocket_remaining(position, random_rockets) {
    var string = `<div>
    <div style='float: left; padding-right: 10px'><img LEFT width='233'></img></div>
    <div style='float: right; padding-left: 10px'><img RIGHT width='233'></img></div>
    </div>`;

    if (position == 'left') {
        string = string.replace('LEFT', `src='stimuli/${random_rockets[0]}'`)
        string = string.replace('RIGHT', '')
    } else if (position == 'right') {
        string = string.replace('LEFT', '')
        string = string.replace('RIGHT', `src='stimuli/${random_rockets[1]}'`)
    }

    return string
}

var rocket_chosen = {
    type: 'html-keyboard-response',
    stimulus: '',
    on_start: function (trial) {
        var key_press = jsPsych.data.get().last(1).values()[0].key_press;
        if (key_press == 37) {
            trial.stimulus = get_rocket_remaining('left', random_rockets);
        } else if (key_press == 39) {
            trial.stimulus = get_rocket_remaining('right', random_rockets);
        } else {
            trial.stimulus = 'Too slow'
        }
    },
    choices: jsPsych.NO_KEYS,
    trial_duration: 500,
    on_finish: function (data) {
        if (rocket_choices[rocket_choices.length - 1] == assigned_info.rocket1) {
            dot_motion_parameters = dot_motion_trial_variable(true);
        } else {
            dot_motion_parameters = dot_motion_trial_variable(false);
        }
        data.event = 'rocket_chosen';
        data.trial_number = trial_number;
        if (debug) {
            console.log('Trial number:', trial_number);
        }
    }
}


var pre_training_rt = [];
var training_points = [];
var is_pre_training;
var is_training;
var is_practice;

var dot_motion = {
    type: "rdk",
    on_start: function () {
        if (rocket_choices[rocket_choices.length - 1] == assigned_info.rocket1) {
            dot_motion_parameters = dot_motion_trial_variable(true);
        } else {
            dot_motion_parameters = dot_motion_trial_variable(false);
        }
    },
    background_color: background_colour,
    choices: [37, 39],
    trial_duration: dot_motion_deadline,
    coherence: function () { return [dot_motion_parameters.majority_coherence, dot_motion_parameters.distractor_coherence] },
    coherent_direction: function () { return dot_motion_parameters.coherent_direction },
    dot_color: function () { return [dot_motion_parameters.majority_col, dot_motion_parameters.distractor_col] },
    correct_choice: function () { return [dot_motion_parameters.correct_choice] },
    move_distance: 9,
    number_of_apertures: 2,
    dot_radius: 2.5, // dot size (default 2)
    number_of_dots: function () { return [dot_motion_parameters.num_majority, dot_motion_parameters.num_distractors] },
    RDK_type: 3,
    aperture_width: 610,
    aperture_center_x: [(window.innerWidth / 2), (window.innerWidth / 2)],
    aperture_center_y: [(window.innerHeight / 2), (window.innerHeight / 2)],
    on_finish: function (data) {
        var current_points = 0;
        if (data.correct) {
            current_points = calculate_points(data.rt, points);
            // TODO push to global variable and compute points (another helper function)
            if (is_pre_training) {
                if (!is_practice) {
                    pre_training_rt.push(data.rt);
                    if (debug) {
                        console.log('Pre-training rt added:', data.rt);
                    }
                }
                data.block = 'pre-training';
            } else if (is_training) {
                training_points.push(current_points);
                if (debug) {
                    console.log('Training rt added:', data.rt);
                }
                data.block = 'training';
            }
            if (debug) {
                console.log('Your answer is correct');
            }
        } else {
            if (is_training) {
                training_points.push(current_points);
                data.block = 'training';
            } else if (is_pre_training) {
                data.block = 'pre-training';
            }
            if (debug) {
                console.log('Your answer is incorrect')
            }
            // TODO push to global variable and save to data 0 points
        }
        data.congruent = dot_motion_parameters.congruent;
        data.points = current_points;
        data.event = 'dot_motion';
        data.trial_number = trial_number;
        if (debug) {
            console.log('Trial number:', trial_number);
            console.log('Current points:', current_points);
        }
    },
    post_trial_gap: function () { return random_choice(itis) }
}
// FIXME: weird that scrollbar shows up during dotmotion rep (see https://github.com/jspsych/jsPsych/discussions/787)

// generate 1 dot motion trial
function dot_motion_trial_variable(is_hard) {
    // select two random colours and assign them to answer and distractor
    var selected_colours = jsPsych.randomization.sampleWithoutReplacement(colours, 2)
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
    if (p_incongruent_dots < Math.random()) { // if incongruent
        if (colours_left.includes(majority_col)) {  // if answer is a left colour
            trial_variable.coherent_direction = [0, 180];  // majority dots move right
        } else {  // if answer is a right colour
            trial_variable.coherent_direction = [180, 0];  // majority dots move left
        }
        trial_variable.congruent = false;
    } else {  // if congruent
        if (colours_left.includes(majority_col)) {  // if answer is a left colour
            trial_variable.coherent_direction = [180, 0];  // majority dots move left
        } else {  // if answer is a right colour
            trial_variable.coherent_direction = [0, 180];  // majority dots move right
        }
        trial_variable.congruent = true;
    }

    // evaluate correct choice
    if (is_hard) {  // if task is hard
        if (colours_left.includes(majority_col)) {
            trial_variable.correct_choice = 37;  // correct answer is left arrow
        } else {
            trial_variable.correct_choice = 39; // correct answer is right arrow
        }
    } else {  // if task is easy
        if (trial_variable.coherent_direction[0] == 0) {  // if majority's coherent direction is right
            trial_variable.correct_choice = 39;  // correct answer is right arrow
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
}

// TODO: 3 blocks: pre-training, training, post-training
// pre-training = post-training -> no feedback for correctness
// no data for post-training
// store dot motion acc, correct rt, num correct
// training -> feedback with aliens
var pre_training = {
    timeline: [rockets, rocket_chosen, dot_motion_trials],
    on_start: function () {
        trial_number++;
        is_pre_training = true;
        is_training = false;
        is_practice = false;
    },
    repetitions: pre_training_repetitions,
}


var training_index = 0
var cue = {
    type: "image-keyboard-response",
    stimulus: '',
    stimulus_height: window.innerHeight / 2,
    maintain_aspect_ratio: true,
    on_start: function () {
        var trial_timeline_variable = training_timeline_variables[training_index]
        if (is_practice) {
            trial_timeline_variable = prac_training_timeline_variables[prac_training_index];
        }
        console.log('TRIAL NUM =', trial_number + 1);
        document.body.style.backgroundImage = "url(" + trial_timeline_variable.cue_image + ")";
        document.body.style.backgroundSize = "cover";
        if (debug) {
            console.log('Training index:', training_index);
        }
    },
    on_finish: function (data) {
        var trial_timeline_variable = training_timeline_variables[training_index]
        if (is_practice) {
            trial_timeline_variable = prac_training_timeline_variables[prac_training_index];
        }
        document.body.style.backgroundImage = '';
        data.cue_type = trial_timeline_variable.trial_type;
        data.event = 'training_cue';
        data.trial_number = trial_number + 1;
        if (debug) {
            console.log('Trial number:', trial_number + 1);
        }
    },
    trial_duration: cue_duration
}
// BUG? cues sometimes are shown for longer than cue_duration? hmm...

var training_timeline_variables = get_training_timeline_variables(num_reward_trials, num_probe_trials, false);

var feedback = {
    type: "html-keyboard-response",
    choices: [],
    trial_duration: feedback_duration,
    stimulus: function () {
        var trial_timeline_variable = training_timeline_variables[training_index]
        if (is_practice) {
            trial_timeline_variable = prac_training_timeline_variables[prac_training_index];
        }
        if (trial_timeline_variable.trial_type == 'reward') {
            let point_scored = mean(training_points.slice(training_points.length - 3)) + rnorm.nextGaussian() * 5;
            return generate_html(Math.round(point_scored), font_colour, 89, [0, -200]);
        } else {
            return ''
        }
    },
    on_start: function () {
        var trial_timeline_variable = training_timeline_variables[training_index]
        if (is_practice) {
            trial_timeline_variable = prac_training_timeline_variables[prac_training_index];
        }
        document.body.style.backgroundImage = "url(" + trial_timeline_variable.feedback_image + ")";
        document.body.style.backgroundSize = "cover";
    },
    on_finish: function (data) {
        var trial_timeline_variable = training_timeline_variables[training_index]
        if (is_practice) {
            trial_timeline_variable = prac_training_timeline_variables[prac_training_index];
            prac_training_index++;
        } else {
            training_index++;
        }
        document.body.style.backgroundImage = '';
        data.cue_type = trial_timeline_variable.trial_type;
        data.mean_points = mean(training_points.slice(training_points.length - 3));
        data.event = 'training_feedback';
        data.trial_number = trial_number;
        if (debug) {
            console.log('Trial number:', trial_number);
        }
    },
}

var training = {
    timeline: [cue, rockets, rocket_chosen, dot_motion_trials, feedback], // TODO add feedback
    on_start: function () {  // does it once during the timeline at the first trial that does not have on_start
        trial_number++;
        is_training = true;
        is_pre_training = false;
        is_practice = false;
        console.log("compute points obj again");
        points = calculate_points_obj(pre_training_rt);
    },
    timeline_variables: training_timeline_variables,
}

// TODO: keep track of accuracy and rt with arrays, clear at the end of each training loop


// Below are actual trials

// TODO: feedback for dot motion practice -> accuracy and rt instead of points. conditionals for dot motion (make feedback larger generate_html)

var practice_hard_dot_accuracies = [];
var practice_hard_dot_prompt = {
    type: "html-keyboard-response",
    stimulus: `
      <div><img src='${images.rocket1}' width='233'></img></div>
    `,
    on_finish: function () {
        dot_motion_parameters = dot_motion_trial_variable(true);
    },
    trial_duration: prac_dot_deadline,
}

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
    data.event = 'practice_hard_rocket';
}

var practice_dot_feedback = {
    type: "html-keyboard-response",
    stimulus: function () {
        if (debug) {
            console.log('Hard dot accuracies:', practice_hard_dot_accuracies);
            console.log('Easy dot accuracies:', practice_easy_dot_accuracies);
        }
        if (JSON.parse(jsPsych.data.getLastTrialData().json())[0].correct) {
            return 'Correct! Your reaction time was ' + jsPsych.data.getLastTrialData().json()[0].rt
        } else {
            return 'Incorrect!'
        }
    },
    trial_duration: prac_dot_feedback_duration,
}
var practice_hard_dot_trials = {
    timeline: [practice_hard_dot_prompt, practice_hard_dot, practice_dot_feedback],
    repetitions: prac_dot_max,
    conditional_function: function () {
        var repeat_colour_practice = true;
        if (practice_hard_dot_accuracies.length > 10) {
            if (practice_hard_dot_accuracies.length <= 15) {
                if (mean(practice_hard_dot_accuracies) > prac_dot_acc) {
                    repeat_colour_practice = false;
                }
            } else if (mean(practice_hard_dot_accuracies.slice(practice_hard_dot_accuracies.length - 15)) > prac_dot_acc) {
                repeat_colour_practice = false;
            }
        }
        return repeat_colour_practice
    },
}

var practice_easy_dot_accuracies = [];
var practice_easy_dot_prompt = {
    type: "html-keyboard-response",
    stimulus: `
      <div><img src='${images.rocket2}' width='233'></img></div>
    `,
    on_finish: function () {
        dot_motion_parameters = dot_motion_trial_variable(false);
    },
    trial_duration: prac_dot_deadline,
}

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
    data.event = 'practice_easy_rocket';
}

var practice_easy_dot_trials = {
    timeline: [practice_easy_dot_prompt, practice_easy_dot, practice_dot_feedback],
    repetitions: prac_dot_max,
    conditional_function: function () {
        var repeat_colour_practice = true;
        if (practice_easy_dot_accuracies.length > 10) {
            if (practice_easy_dot_accuracies.length <= 15) {
                if (mean(practice_easy_dot_accuracies) > prac_dot_acc) {
                    repeat_colour_practice = false;
                }
            } else if (mean(practice_easy_dot_accuracies.slice(practice_easy_dot_accuracies.length - 15)) > prac_dot_acc) {
                repeat_colour_practice = false;
            }
        }
        return repeat_colour_practice
    },
}

// TODO: rocket choosing practice, just rockets and rockets chosen, instructions for choosing hard / easy
var practice_rocket_prompt = jsPsych.randomization.sampleWithoutReplacement(['colour', 'motion'], 1)[0];
var practice_rocket = {
    type: "html-keyboard-response",
    stimulus: function () {
        random_rockets = jsPsych.randomization.shuffle([assigned_info.rocket1, assigned_info.rocket2]);
        return `Choose the rocket associated to the <b>${practice_rocket_prompt}</b> task
        <div>
        <div style='float: left; padding-right: 10px'><img src='stimuli/${random_rockets[0]}' width='233'></img></div>
        <div style='float: right; padding-left: 10px'><img src='stimuli/${random_rockets[1]}' width='233'></img></div>
        </div>
    `
    },
    choices: function () {
        var choices_arr;
        if (practice_rocket_prompt == 'colour') {
            if (random_rockets[0] == assigned_info.rocket1) {
                choices_arr = [37]
            } else {
                choices_arr = [39]
            }
        } else {
            if (random_rockets[0] == assigned_info.rocket2) {
                choices_arr = [37]
            } else {
                choices_arr = [39]
            }
        }
        return choices_arr
    },
    trial_duration: prac_rocket_deadline,
    post_trial_gap: 300,
    on_finish: function (data) {
        data.event = 'practice_rocket';
        practice_rocket_prompt = jsPsych.randomization.sampleWithoutReplacement(['colour', 'motion'], 1)[0];
    }

}

var practice_rocket_trials = {
    timeline: [practice_rocket],
    repetitions: prac_rocket_max,
}

// TODO: deepcopy pre-training for 5 trials of practice


var alien_introduction = {
    timeline: [
        {
            type: 'html-keyboard-response',
            stimulus: generate_html('This is the reward alien', font_colour, 48),
            on_start: function () {
                document.body.style.backgroundImage = "url(" + images.reward + ")";
                document.body.style.backgroundSize = "cover";
            },
        },
        {
            type: 'html-keyboard-response',
            stimulus: generate_html('This is the no reward alien', font_colour, 48),
            on_start: function () {
                document.body.style.backgroundImage = "url(" + images.no_reward + ")";
                document.body.style.backgroundSize = "cover";
            },
            on_finish: function () {
                document.body.style.backgroundImage = '';
            }
        }
    ],
};


var practice_pre_training = jsPsych.utils.deepCopy(pre_training);
practice_pre_training.on_start = function () {
    trial_number++;
    is_pre_training = true;
    is_training = false;
    is_practice = true;
};
practice_pre_training.repetitions = practice_pre_training_repetitions;

var mixed_training_timeline_variables = [{ trial_type: 'reward', cue_image: 'stimuli/alien_reward.png', feedback_image: 'stimuli/alien_reward_feedback.png' }, { trial_type: 'probe', cue_image: 'stimuli/alien_noreward.png', feedback_image: 'stimuli/alien_noreward_feedback.png' }];
var prac_reward_training_timeline_variables = Array(5).fill(mixed_training_timeline_variables[0]);
var prac_noreward_training_timeline_variables = Array(5).fill(mixed_training_timeline_variables[1]);
var prac_mixed_training_timeline_variables = [];
for (i = 0; i < 4; i++) {
    prac_mixed_training_timeline_variables.push(...mixed_training_timeline_variables);
}
var prac_training_timeline_variables = [prac_reward_training_timeline_variables, prac_noreward_training_timeline_variables, prac_mixed_training_timeline_variables].flat();

var prac_training_index = 0
var practice_training = jsPsych.utils.deepCopy(training);
practice_training.on_start = function () {  // does it once during the timeline at the first trial that does not have on_start
    trial_number++;
    is_training = true;
    is_pre_training = false;
    is_practice = true;
    points = calculate_points_obj(pre_training_rt);
};
practice_training.timeline_variables = prac_training_timeline_variables;

// TODO: post training, identical to pre-training, change event, do not store anything extra, store post-training to data.block






























// DEFINE TASK PARAMETERS (required)
var num_to_update = null; // number to add to every digit
var n_digits = 3; // amount of numbers to show (must be > 1)
var n_distract_response = 3; // amount of distractors
var n_update_trial = 5; // number of trials and the amount of sequences to show
var n_practice_update_trial = 1; // number of practice trials and the amount of sequences to show
var duration_digit = 500; // how long to show each digit (ms)
var duration_post_digit = 200;  // pause duration after each digit
var update_feedback_duration = 1500;
var rt_update_deadline = 3000;
var options_deadline = null;

if (debug) {
    rt_update_deadline = 60000;
}

// keycode for responses
var choices = [
    { keycode: 37, response: 'left' },
    { keycode: 39, response: 'right' },
];
if (n_distract_response == 3) {
    choices = choices.concat([{ keycode: 38, response: 'up' }, { keycode: 40, response: 'down' }]) // 3 distractors + 1 correct
}

// generate mental math updating array
// determine correct response
function number_update(array1, array2) {
    var array_output = [];
    var str_output = '';
    for (i = 0; i < array1.length; i++) {
        if (array2.length < array1.length) {
            if (array2[0] > 9) throw "number in array2 must be < 10";
            if (array2[0] < -9) throw "number in array2 must be > -10";
            var correct_num = array1[i] + array2[0]; // if array2 is shorter than array1, always add the first element of array2 to each element in array1
        } else if (array1.length == array2.length) {
            if (array2[i] > 9) throw "number in array2 must be < 10";
            if (array2[i] < -9) throw "number in array2 must be > -10";
            var correct_num = array1[i] + array2[i];
        };
        if (correct_num < 0) {
            correct_num += 10;
        } else if (correct_num > 9) {
            correct_num -= 10;
        }
        str_output = str_output.concat(correct_num.toString()); // concat string integers
        array_output.push(correct_num);
    }
    return [array_output, str_output]
}

// create distractors/wrong responses
function generate_similar_numbers(array, n_distractors) {
    var result = [];
    var v = 1; // distractor's difference from correct answer, changes with each additional distractor
    while (result.length < n_distractors) { // loop stops when the result array is full
        for (i = 0; i < array.length; i++) { // iterate through the different indeces of different distractors
            result.push(array.slice(0, array.length));
            result.push(array.slice(0, array.length)); // append two copies of the correct answer into the result
            var y = array[i] // y is a copy of the correct answer's digit at different indeces
            var y_plus = y + v;
            var y_minus = y - v;
            if (y_plus > 9) {
                y_plus -= 10;
            };
            if (y_minus < 0) {
                y_minus += 10;
            };
            result[result.length - 1][i] = y_plus;
            result[result.length - 2][i] = y_minus; // the two copies undergo different changes at the same index.
            // in the next iteration, newly pushed distractors change at the next index, but the same locations for the previous iteration's distractors do not change.
        };
        v += 1;
    };
    return [array].concat(shuffle(result.slice(0, n_distractors))); // [array + distractors]
}

// cue/prompt above each digit (string) (e.g., +3, -2)
function update_prompt(digit) {
    var s;
    if (digit >= 0) {
        s = "+" + digit;
    } else {
        s = "&#x2212;" + Math.abs(digit);  // minus sign
    }
    return s;
}

function process_choices(choices) {
    var choices_copy = jsPsych.utils.deepCopy(choices);
    var shuffled_options = [];
    var options = generate_similar_numbers(number_update(temp_digits, [num_to_update])[0], n_distract_response);
    options = options.map(x => x.join(''));
    shuffled_options.push(
        { prompt: options[0], correct: true }
    );
    for (i = 1; i < n_distract_response + 1; i++) {
        shuffled_options.push(
            { prompt: options[i], correct: false }
        )
    }
    shuffled_options = shuffle(shuffled_options)
    for (i = 0; i < n_distract_response + 1; i++) {
        choices_copy[i] = Object.assign(choices_copy[i], shuffled_options[i]);
    }
    return choices_copy
}

var update_instructions1 = {
    type: "instructions",
    pages: [
        generate_html("Welcome!", font_colour) + generate_html("Click next or press the right arrow key to proceed.", font_colour),
        generate_html("You have a limited amount of time to see each number, so react quickly!", font_colour),
        generate_html("Next up is a practice trial.", font_colour) + generate_html("Your data will NOT be recorded.", font_colour) + generate_html("Click next or press the right arrow key to begin.", font_colour)
    ],
    show_clickable_nav: true,
    show_page_number: true,
};


var update_instructions2 = {
    type: "instructions",
    pages: [
        generate_html("That was the practice trial.", font_colour) + generate_html("Click next or press the right arrow key to begin the experiment.", font_colour) + generate_html("Your data WILL be recorded this time.", font_colour)
    ],
    show_clickable_nav: true,
    show_page_number: false,
};

var option1 = 0
var option2 = 3

var options = {
    type: "html-keyboard-response",
    stimulus: function () {
        option2 = 3;
        if (Math.random() < 0.5) {
            option2 = 5;
        }
        var option2_str = "+" + String(option2)
        return generate_html("0", font_colour, 30, [-100, 25]) + generate_html(option2_str, font_colour, 30, [100, -25]);
    },
    choices: [37, 39],
    trial_duration: options_deadline,
    data: { event: "choice_options" },
    post_trial_gap: 500,
    on_finish: function (data) {
        if (data.key_press == 37) { // pressed left
            num_to_update = option1;
        } else if (data.key_press == 39) { // pressed right
            num_to_update = option2;
        } else { // no response
            num_to_update = null;
        };
        data.choice = num_to_update;
        data.hard_choice = option2;
        if (data.choice == data.hard_choice) {
            data.percent_hard = 1;
        } else {
            data.percent_hard = 0;
        }
    }
};

var prompt_digit = {
    type: "html-keyboard-response",
    stimulus: function () {
        var remind = update_prompt(num_to_update) + " to each digit";
        remind = generate_html(remind, font_colour, 30);
        return remind
    },
    choices: jsPsych.NO_KEYS,
    trial_duration: 1000,
    data: { event: "digit_prompt" },
    post_trial_gap: 750
};

var temp_digits = [];
var number_sequence = {
    timeline: [
        {
            type: "html-keyboard-response",
            stimulus: function () {
                var remind = update_prompt(num_to_update);
                remind = generate_html(remind, font_colour, 30) + "<br>";
                var d = generate_html(jsPsych.timelineVariable('digit', true), font_colour, 80)
                return remind + d;
            },
            choices: jsPsych.NO_KEYS,
            trial_duration: duration_digit,
            data: { event: "digit" },
            post_trial_gap: duration_post_digit,
            on_finish: function (data) {
                data.digit = jsPsych.timelineVariable('digit', true);
                temp_digits.push(data.digit);
            }
        }
    ],
    timeline_variables: Array.from(range(0, 10), x => Object({ digit: x })),
    sample: { // pick different n_digits to present on each trial/sequence
        type: 'with-replacement',
        size: n_digits
    }
}

var choices_shuffle;
var update_response = {
    type: "html-keyboard-response",
    stimulus: function () {
        choices_shuffle = process_choices(choices);
        prompt_html = generate_html(choices_shuffle[0].prompt, font_colour, 30, [-100, 50]) + generate_html(choices_shuffle[1].prompt, font_colour, 30, [100, 2]);
        if (n_distract_response == 3) {
            prompt_html = prompt_html.concat(generate_html(choices_shuffle[2].prompt, font_colour, 30, [0, -100]) + generate_html(choices_shuffle[3].prompt, font_colour, 30, [0, -35]));
        }
        if (debug) {
            console.log(choices_shuffle);
        }
        return prompt_html;
    },
    choices: choices.map(x => x.keycode),
    trial_duration: rt_update_deadline,
    data: { event: "response" },
    post_trial_gap: 500,
    on_finish: function (data) {
        var chosen = choices_shuffle.filter(x => x.keycode == data.key_press)[0];
        data.num_to_update = num_to_update;
        if (!chosen) { // no response
            data.acc = null;
            data.response = null;
        } else {  // response made
            data.response = chosen.response;
            if (chosen.correct) {
                data.acc = 1;
            } else {
                data.acc = 0;
            }
        }
        temp_digits = []; // clear digit sequences for next trial
    }
}

var update_feedback = {
    type: "html-keyboard-response",
    stimulus: function () {
        last_trial_data = jsPsych.data.getLastTrialData();
        last_trial_value = last_trial_data.select('acc').values[0];
        if (last_trial_value > 0) {
            var prompt = "correct, your reaction time was " + Math.round(last_trial_data.select('rt').values[0]) + " ms";
        } else if (last_trial_value === null) {
            var prompt = "respond faster";
        } else {
            var prompt = "wrong";
        }
        return generate_html(prompt, font_colour, 25);
    },
    choices: jsPsych.NO_KEYS,
    trial_duration: feedback_duration,
    data: { event: "feedback" },
    post_trial_gap: 500
}

var trial_sequence = {
    timeline: [options, prompt_digit, number_sequence, update_response, update_feedback],
    repetitions: n_update_trial,
};

var practice_sequence = jsPsych.utils.deepCopy(trial_sequence);
practice_sequence.repetitions = n_practice_update_trial
for (i = 0; i < practice_sequence.timeline.length; i++) {
    practice_sequence.timeline[i].data = { event: "practice" }
}




var timeline = [];
// timeline.push(instructions);
timeline.push(colour_blocks);
// timeline.push(practice_hard_dot_trials);
// timeline.push(practice_easy_dot_trials);
// timeline.push(practice_rocket_trials);
// timeline.push(alien_introduction);
// create timeline and updatemath events/objects for study (the first next lines are always the same!)
// timeline.push(update_instructions1);
// if (n_practice_update_trial > 0) {
//     timeline.push(practice_sequence, update_instructions2);
// }
// timeline.push(trial_sequence);
// timeline.push(practice_pre_training);
// timeline.push(pre_training);
timeline.push(practice_training);
// timeline.push(training);


jsPsych.init({
    timeline: timeline,
    preload_images: Object.values(images),
    on_finish: function () {
        jsPsych.data.displayData();
    }
});


