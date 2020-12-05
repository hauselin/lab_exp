const image_link = '1.gif';
const num_back = 2;
const grid_size = 3;

function update_array(array, new_entry) {
    array.shift();
    array.push(new_entry);
    return array
}

var scene = [];
for (var i = 0; i < grid_size; i++) {
    scene[i] = new Array(grid_size).fill(0);
}

var trial = {
    type: 'html-keyboard-response',
    stimulus: jsPsych.plugins['vsl-grid-scene'].generate_stimulus(scene, [100, 100]),
    on_start: function () {
        tile = Math.floor(Math.random() * (grid_size ** 2));
        console.log(tile);
    },
}

var trials = {
    timeline: [trial],
    repetitions: 3,
}

jsPsych.init({
    timeline: [trials],
    on_finish: function () { jsPsych.data.displayData(); },
});