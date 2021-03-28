var font_colour = "white";
var background_colour = "black";
set_colour(font_colour, background_colour);

const rocket_files = [
    'stimuli/rocket01.jpg',
    'stimuli/rocket02.jpg',
    'stimuli/rocket03.jpg',
    'stimuli/rocket04.jpg',
    'stimuli/rocket05.jpg',
    'stimuli/rocket06.jpg'
]

const rockets_shuffled = jsPsych.randomization.shuffle(rocket_files)
const rocket1 = rockets_shuffled[0]
const rocket2 = rockets_shuffled[1]


var rockets = {
    type: "html-keyboard-response",
    stimulus: `
      <div>
      <div style='float: left; padding-right: 10px'><img src='${rocket1}' width='100'></img></div>
      <div style='float: right; padding-left: 10px'><img src='${rocket2}' width='100'></img></div>
      </div>
    `,
    choices: [37, 39],
};

var left_rocket_remaining = {
    type: "html-keyboard-response",
    stimulus: `
      <div>
      <div style='float: left; padding-right: 10px'><img src='${rocket1}' width='100'></img></div>
      <div style='float: right; padding-left: 10px'><img width='100'></img></div>
      </div>
    `,
    choices: jsPsych.NO_KEYS,
    trial_duration: 1000
};

var right_rocket_remaining = {
    type: "html-keyboard-response",
    stimulus: `
      <div>
      <div style='float: left; padding-right: 10px'><img width='100'></img></div>
      <div style='float: right; padding-left: 10px'><img src='${rocket2}' width='100'></img></div>
      </div>
    `,
    choices: jsPsych.NO_KEYS,
    trial_duration: 1000
};


jsPsych.init({
    timeline: [rockets],
    on_finish: function () {
        jsPsych.data.displayData();
    }
});