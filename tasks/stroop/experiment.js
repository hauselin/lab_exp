var subject = jsPsych.randomization.randomID(15);

const trial_duration = 1500;
const choices = [
    'red',
    'green',
    'blue'
];
const congruent_trials = 5;
const incongruent_trials = 2;   // precondition: incongruent_trials <= (congruent_trials + neutral_trials + 1).
const neutral_trials = 5;
// warning from jsPsych documentation: if you provide an array that has very few valid permutations with no neighboring elements, then this method will fail and cause the browser to hang.
const neutral_prompt = 'any colour';
const dark_background = false;
var itis = iti_exponential(low = 200, high = 500);

if (dark_background){
    document.body.style.backgroundColor = "black";
    font_colour = "white";
} else if (!dark_background){
    document.body.style.backgroundColor = "white";
    font_colour = "black";
};

var slow_response = null;

jsPsych.data.addProperties({
    subject: subject,
    browser: navigator.userAgent,
    datetime: Date(),
});

function generate_variables(congruency, incongruency, neutrality) {
    mutable_choices = choices.slice();
    variables = [];
    for (i = 0; i < congruency; i++) {
        colour = random_choice(choices);
        variables.push({colour: colour, text: colour, incongruency: false});
    }
    for (i = 0; i < incongruency; i++) {
        colour = random_choice(choices);
        mutable_choices.splice(choices.indexOf(colour), 1);
        text = random_choice(mutable_choices);
        variables.push({colour: colour, text: text, incongruency: true});
        mutable_choices = choices.slice();
    }
    for (i = 0; i < neutrality; i++) {
        colour = random_choice(choices);
        variables.push({colour: colour, text: neutral_prompt, incongruency: false});
    }
    // console.log(variables);
    return jsPsych.randomization.shuffleNoRepeats(variables, function(before, after) {
        return before.incongruency && after.incongruency;
    });
}
// console.log(generate_variables(congruent_trials, incongruent_trials, neutral_trials));

const variable_array = generate_variables(congruent_trials, incongruent_trials, neutral_trials);
var variable_index = 0;
var stimulus_and_response = {
    type: 'html-keyboard-response',
    choices: ['r', 'g', 'b'],
    trial_duration: trial_duration,
    response_ends_trial: false,
    timeline: [{
        stimulus: function(){
            text_stimulus = variable_array[variable_index].text;
            colour_stimulus = variable_array[variable_index].colour;
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
        variable_index++;
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

timeline = [];
for (i = 0; i < (congruent_trials + incongruent_trials + neutral_trials); i++) {
    timeline.push({
        type: 'html-keyboard-response',
        stimulus: '<p style="font-size: 48px; color: ' + font_colour +'">+</p>',
        choices: jsPsych.NO_KEYS,
        trial_duration: random_choice(itis),
    });
    timeline.push(stimulus_and_response);
    timeline.push(slow_response_feedback);
}

jsPsych.init({
    timeline: timeline,
    on_finish: function () {
        jsPsych.data.displayData();
    }
});