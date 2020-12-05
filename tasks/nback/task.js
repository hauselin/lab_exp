const image_link = '1.gif';
const num_back = 2;

function update_array(array, new_entry) {
    array.shift();
    array.push(new_entry);
    return array
}

var scene =
    [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
    ];

var trial = {
    type: 'vsl-grid-scene',
    stimuli: scene,
    image_size: [100, 100]
};

var trial_2 = {
    type: 'html-keyboard-response',
    stimulus: jsPsych.plugins['vsl-grid-scene'].generate_stimulus(scene, [100, 100])
}

jsPsych.init({
    timeline: [trial, trial_2],
    on_finish: function () { jsPsych.data.displayData(); }
});