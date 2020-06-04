var subject = jsPsych.randomization.randomID(15);
const trials = 3;
const trial_duration = 1000;
const choices = [
    'red',
    'green',
    'blue'
];
const dark_background = false;
if (dark_background){
    document.body.style.backgroundColor = "black";
    font_colour = "white";
} else if (!dark_background){
    document.body.style.backgroundColor = "white";
    font_colour = "black";
};
var slow_response = null;
timeline = [];

jsPsych.data.addProperties({
    subject: subject,
    browser: navigator.userAgent,
    datetime: Date(),
});

var stimulus_and_response = {
    type: 'html-keyboard-response',
    choices: ['r', 'g', 'b'],
    trial_duration: trial_duration,
    timeline: [{
        stimulus: function(){
            text_stimulus = random_choice(choices);
            colour_stimulus = random_choice(choices);
            return '<p style="font-size: 48px; color: ' + colour_stimulus +'">' + text_stimulus +'</p>';
        }
    }],
    on_finish: function (data) {
        data.key_press = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(data.key_press)
        data.text_stimulus = text_stimulus;
        data.colour_stimulus = colour_stimulus;
        data.correctness = (data.key_press == data.colour_stimulus.substring(0, 1));
        if(data.key_press){
            slow_response = false;
        } else if(!data.key_press){
            slow_response = true;
        }
        data.slow_response = slow_response;
    }
};

var slow_response_feedback = {
    type: 'html-keyboard-response',
    choices: jsPsych.NO_KEYS,
    timeline: [{
        stimulus: function() {
            if (slow_response){
                return '<p style="font-size: 48px; color: ' + font_colour +'">Response is too slow.</p>';
            } else if (!slow_response){
                return '';}},
        trial_duration: function() {
            if (slow_response){
                return 1000;
            } else if (!slow_response){
                return 0;}},
        },
    ]
};

var iti_duration = random_choice(iti_exponential(low = 200, high = 500));
var iti = {
    type: 'html-keyboard-response',
    stimulus: '<p style="font-size: 48px; color: ' + font_colour +'">+</p>',
    choices: jsPsych.NO_KEYS,
    trial_duration: iti_duration,
};

var i = 0;
while (i < trials) {
    timeline.push(iti);
    timeline.push(stimulus_and_response);
    timeline.push(slow_response_feedback);
    i++;
}