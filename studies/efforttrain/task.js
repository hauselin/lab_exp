var font_colour = "white";
var background_colour = "black";
set_colour(font_colour, background_colour);

var subject_id = 1;
var assigned_info = assign.filter(i => i.subject == subject_id)[0];

var rocket_choices = [];

var rockets = {
    type: "html-keyboard-response",
    stimulus: `
      <div>
      <div style='float: left; padding-right: 10px'><img src='stimuli/${assigned_info.rocket1}' width='100'></img></div>
      <div style='float: right; padding-left: 10px'><img src='stimuli/${assigned_info.rocket2}' width='100'></img></div>
      </div>
    `,
    choices: [37, 39],
    trial_duration: 3000,
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
    <div style='float: left; padding-right: 10px'><img src='stimuli/${assigned_info.rocket1}' width='100'></img></div>
    <div style='float: right; padding-left: 10px'><img width='100'></img></div>
    </div>`;

var right_rocket_remaining =
    `<div>
    <div style='float: left; padding-right: 10px'><img width='100'></img></div>
    <div style='float: right; padding-left: 10px'><img src='stimuli/${assigned_info.rocket2}' width='100'></img></div>
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


jsPsych.init({
    timeline: [rockets, rocket_chosen],
    on_finish: function () {
        jsPsych.data.displayData();
    }
});