const image_link = '1.gif';
const num_back = 2;
const grid_size = 3;
const n_trials = 3;

function update_array(array, new_entry) {
    array.shift();
    array.push(new_entry);
    return array
}

function update_scene(matrix, coords) {
    var new_matrix = jsPsych.utils.deepCopy(matrix);
    new_matrix[coords[1]][coords[0]] = image_link;
    return new_matrix
}

var scene = [];
for (var i = 0; i < grid_size; i++) {
    scene[i] = new Array(grid_size).fill(0);
}

var scenes = [];
for (var i = 0; i < n_trials; i++) {
    tile_x = Math.floor(Math.random() * (grid_size));
    tile_y = Math.floor(Math.random() * (grid_size));
    console.log([tile_x, tile_y]);
    scenes.push({stimulus: jsPsych.plugins['vsl-grid-scene'].generate_stimulus(update_scene(scene, [tile_x, tile_y]), [100, 100])});
}

var trial = {
    type: 'html-keyboard-response',
    stimulus: jsPsych.timelineVariable('stimulus'),
}

var trials = {
    timeline: [trial],
    timeline_variables: scenes,
}

jsPsych.init({
    timeline: [trials],
    on_finish: function () { jsPsych.data.displayData(); },
});