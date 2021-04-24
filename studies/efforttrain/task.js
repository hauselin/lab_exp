var font_colour = "white";
var background_colour = "black";
set_colour(font_colour, background_colour);

trial_repetitions = 5;
rocket_selection_deadline = null; // ms

// colours used for task, with left and right randomized for each experiment
colours = ['red', 'blue', 'green', 'yellow'];
var colours = jsPsych.randomization.repeat(colours, 1);
colours_left = colours.slice(2, 4)
colours_right = colours.slice(0, 2)

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
    pages: [
        generate_html("Welcome!", font_colour) + generate_html("Click next or press the right arrow key to proceed.", font_colour),
    ],
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

var colour_blocks = {
    type: "html-keyboard-response",
    stimulus: `
    <div style='width: 100px; float:left; padding-right: 10px;'>
    <div style='background-color: ${colours_left[0]}; margin-bottom: 20px; width: 100px; height: 100px; position: relative;'></div>
    <div style='background-color: ${colours_left[1]}; width: 100px; height: 100px; position: relative'></div>
    </div>
    <div style='width: 100px; float:right; padding-left: 10px;'>
    <div style='background-color: ${colours_right[0]}; margin-bottom: 20px; width: 100px; height: 100px; position: relative;'></div>
    <div style='background-color: ${colours_right[1]}; width: 100px; height: 100px; position: relative'></div>
    </div>
  `
}


var rocket_choices = [];
var rockets = {
    type: "html-keyboard-response",
    stimulus: `
      <div>
      <div style='float: left; padding-right: 10px'><img src='${images.rocket1}' width='100'></img></div>
      <div style='float: right; padding-left: 10px'><img src='${images.rocket2}' width='100'></img></div>
      </div>
    `,
    choices: [37, 39],
    trial_duration: rocket_selection_deadline,
    on_finish: function (data) {
        if (data.key_press == 37) {
            data.rocket = assigned_info.rocket1
        } else {
            data.rocket = assigned_info.rocket2
        }
        rocket_choices.push(data.rocket);
    }
};

var left_rocket_remaining =
    `<div>
    <div style='float: left; padding-right: 10px'><img src='${images.rocket1}' width='100'></img></div>
    <div style='float: right; padding-left: 10px'><img width='100'></img></div>
    </div>`;

var right_rocket_remaining =
    `<div>
    <div style='float: left; padding-right: 10px'><img width='100'></img></div>
    <div style='float: right; padding-left: 10px'><img src='${images.rocket2}' width='100'></img></div>
    </div>`;

var rocket_chosen = {
    type: 'html-keyboard-response',
    stimulus: '',
    on_start: function (trial) {
        var key_press = jsPsych.data.get().last(1).values()[0].key_press;
        if (key_press == 37) {
            trial.stimulus = left_rocket_remaining;
        } else if (key_press == 39) {
            trial.stimulus = right_rocket_remaining;
        } else {
            trial.stimulus = 'Too slow'
        }
    },
    choices: jsPsych.NO_KEYS,
    trial_duration: 500,
}

var dot_motion_rt = [];
var dot_motion = {
    type: "rdk",
    background_color: background_colour,
    choices: [37, 39],
    trial_duration: 10000,
    coherence: [0.1, 1.0],
    dot_color: ["blue", "red"],
    move_distance: 6,
    number_of_apertures: 2,
    number_of_dots: [50, 200],
    RDK_type: 2,
    aperture_width: 500,
    aperture_center_x: [(window.innerWidth / 2), (window.innerWidth / 2)],
    aperture_center_y: [(window.innerHeight / 2), (window.innerHeight / 2)],
    on_finish: function (data) {
        dot_motion_rt.push(data.rt);
    }
}


// TODO: 3 blocks: pre-training, training, post-training
// pre-training = post-training -> no feedback for correctness
// no data for post-training
// store dot motion acc, correct rt, num correct
// training -> feedback with aliens
var rockets_procedure = {
    timeline: [rockets, rocket_chosen, dot_motion],
    repetitions: trial_repetitions,
}



var timeline = []
// timeline.push(instructions);
timeline.push(colour_blocks);
timeline.push(rockets_procedure);



jsPsych.init({
    // timeline: [instructions, rockets_procedure],
    timeline: timeline,
    preload_images: Object.values(images),
    on_finish: function () {
        jsPsych.data.displayData();
    }
});