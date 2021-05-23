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
// practice colour blocks
var prac_colour_acc = 0.8; // required accuracy for the last 15 trials
var prac_colour_max = 80; // maximum practice trials before moving on
var prac_colour_deadline = 15000; // rt deadline for colour block practice trial
var prac_colour_feedback_duration = 1000 // feedback duration
// practice dot motion
var prac_dot_trials = 5; // number of practice trials
var prac_dot_prompt_duration = 2000; // hard rocket prompt duration
var prac_dot_feedback_duration = 2000; // feedback duration
// practice rocket selection
var prac_rocket_max = 10; // maximum practice trials before moving on
var prac_rocket_deadline = 15000; // rt deadline for colour block practice trial
var prac_rocket_feedback_duration = 1000 // feedback duration

// pre_training block parameters
const pre_trial_repetitions = 5;

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
                pre_training_rt.push(data.rt);
                if (debug) {
                    console.log('Pre-training rt added:', data.rt);
                }
            } else if (is_training) {
                training_points.push(current_points);
                if (debug) {
                    console.log('Training rt added:', data.rt);
                }
            }
            if (debug) {
                console.log('Your answer is correct');
            }
        } else {
            if (is_training) {
                training_points.push(current_points);
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
    },
    repetitions: pre_trial_repetitions,
}


var training_index = 0
var cue = {
    type: "image-keyboard-response",
    stimulus: '',
    stimulus_height: window.innerHeight / 2,
    maintain_aspect_ratio: true,
    on_start: function () {
        console.log('TRIAL NUM =', trial_number + 1);
        document.body.style.backgroundImage = "url(" + training_timeline_variables[training_index].cue_image + ")";
        document.body.style.backgroundSize = "cover";
        if (debug) {
            console.log('Training index:', training_index);
        }
    },
    on_finish: function (data) {
        document.body.style.backgroundImage = '';
        data.cue_type = training_timeline_variables[training_index].trial_type;
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
        if (training_timeline_variables[training_index].trial_type == 'reward') {
            let point_scored = mean(training_points.slice(training_points.length - 3)) + rnorm.nextGaussian() * 5;
            return generate_html(Math.round(point_scored), font_colour, 89, [0, -200]);
        } else {
            return ''
        }
    },
    on_start: function () {
        document.body.style.backgroundImage = "url(" + training_timeline_variables[training_index].feedback_image + ")";
        document.body.style.backgroundSize = "cover";
    },
    on_finish: function (data) {
        document.body.style.backgroundImage = '';
        data.cue_type = training_timeline_variables[training_index].trial_type;
        data.mean_points = mean(training_points.slice(training_points.length - 3));
        data.event = 'training_feedback';
        data.trial_number = trial_number;
        if (debug) {
            console.log('Trial number:', trial_number);
        }
        training_index++;
    },
}

var training = {
    timeline: [cue, rockets, rocket_chosen, dot_motion_trials, feedback], // TODO add feedback
    on_start: function () {  // does it once during the timeline at the first trial that does not have on_start
        trial_number++;
        is_training = true;
        is_pre_training = false;
        console.log("compute points obj again");
        points = calculate_points_obj(pre_training_rt);
    },
    timeline_variables: training_timeline_variables,
}

// TODO: keep track of accuracy and rt with arrays, clear at the end of each training loop


// Below are actual trials

// TODO: feedback for dot motion practice -> accuracy and rt instead of points. conditionals for dot motion (make feedback larger generate_html)

var practice_colour_accuracies = [];
var practice_colour_prompt = jsPsych.randomization.sampleWithoutReplacement(colours, 1)[0];
var practice_colour = {
    type: "html-keyboard-response",
    stimulus: function () {
        return `<div style='background-color: ${practice_colour_prompt}; width: 100px; height: 100px;'></div>`
    },
    choices: [37, 39],
    trial_duration: prac_colour_deadline,
    on_finish: function (data) {
        if (data.key_press == 37) {
            if (colours_left.includes(practice_colour_prompt)) {
                data.correct = true;
            } else {
                data.correct = false;
            }
        } else if (data.key_press == 39) {
            if (colours_right.includes(practice_colour_prompt)) {
                data.correct = true;
            } else {
                data.correct = false;
            }
        }
        if (data.correct) {
            practice_colour_accuracies.push(1);
        } else {
            practice_colour_accuracies.push(0);
        }

        if (debug) {
            console.log(practice_colour_accuracies);
        }

        data.event = 'practice_colour';
        practice_colour_prompt = jsPsych.randomization.sampleWithoutReplacement(colours, 1)[0];
    }
};

var practice_colour_feedback = {
    type: "html-keyboard-response",
    stimulus: function () {
        if (JSON.parse(jsPsych.data.getLastTrialData().json())[0].correct == true) {
            return 'Your answer is correct'
        } else if (JSON.parse(jsPsych.data.getLastTrialData().json())[0].correct == false) {
            return 'Your answer is incorrect'
        } else {
            return 'Response faster'
        }
    },
    trial_duration: prac_colour_feedback_duration,
}

var practice_colour_trials = {
    timeline: [practice_colour, practice_colour_feedback],
    repetitions: prac_colour_max,
    conditional_function: function () {
        var repeat_colour_practice = true;
        if (practice_colour_accuracies.length > 10) {
            if (practice_colour_accuracies.length <= 15) {
                if (mean(practice_colour_accuracies) > prac_colour_acc) {
                    repeat_colour_practice = false;
                }
            } else if (mean(practice_colour_accuracies.slice(practice_colour_accuracies.length - 15)) > prac_colour_acc) {
                repeat_colour_practice = false;
            }
        }
        return repeat_colour_practice
    },
}

var practice_hard_dot_prompt = {
    type: "html-keyboard-response",
    stimulus: `
      <div><img src='${images.rocket1}' width='233'></img></div>
    `,
    on_finish: function () {
        dot_motion_parameters = dot_motion_trial_variable(true);
    },
    trial_duration: prac_dot_prompt_duration,
}

var practice_hard_dot = jsPsych.utils.deepCopy(dot_motion);
practice_hard_dot.on_start = function () {
    dot_motion_parameters = dot_motion_trial_variable(true);
};
practice_hard_dot.on_finish = function (data) {
    if (data.correct) {
        data.points = calculate_points(data.rt, points);
    } else {
        data.points = 0;
    }
    data.event = 'practice_hard_rocket';
}

var practice_dot_feedback = {
    type: "html-keyboard-response",
    stimulus: function () {
        return JSON.parse(jsPsych.data.getLastTrialData().json())[0].points
    },
    trial_duration: prac_dot_feedback_duration,
}
var practice_hard_dot_trials = {
    timeline: [practice_hard_dot_prompt, practice_hard_dot, practice_dot_feedback],
    repetitions: prac_dot_trials,
}

var practice_easy_dot_prompt = {
    type: "html-keyboard-response",
    stimulus: `
      <div><img src='${images.rocket2}' width='233'></img></div>
    `,
    on_finish: function () {
        dot_motion_parameters = dot_motion_trial_variable(false);
    },
    trial_duration: prac_dot_prompt_duration,
}

var practice_easy_dot = jsPsych.utils.deepCopy(dot_motion);
practice_easy_dot.on_start = function () {
    dot_motion_parameters = dot_motion_trial_variable(false);
};
practice_easy_dot.on_finish = function (data) {
    if (data.correct) {
        data.points = calculate_points(data.rt, points);
    } else {
        data.points = 0;
    }
    data.event = 'practice_easy_rocket';
}

var practice_easy_dot_trials = {
    timeline: [practice_easy_dot_prompt, practice_easy_dot, practice_dot_feedback],
    repetitions: prac_dot_trials,
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

var timeline = [];
// timeline.push(instructions);
timeline.push(colour_blocks);
// timeline.push(practice_colour_trials);
// timeline.push(practice_hard_dot_trials);
// timeline.push(practice_easy_dot_trials);
// timeline.push(practice_rocket_trials);

// timeline.push(pre_training);
// timeline.push(training);

// TODO: post training


jsPsych.init({
    timeline: timeline,
    preload_images: Object.values(images),
    on_finish: function () {
        jsPsych.data.displayData();
    }
});


