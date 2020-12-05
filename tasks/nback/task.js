const image_link = '1.gif';
const num_back = 1;
const grid_size = 3;
const n_trials = 5;
const trial_duration = 1500;

function update_array(array, new_entry) {
    var new_array = jsPsych.utils.deepCopy(array);
    new_array.shift();
    new_array.push(new_entry);
    return new_array
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
var coordinates = [];
for (var i = 0; i < n_trials; i++) {
    tile_x = Math.floor(Math.random() * (grid_size));
    tile_y = Math.floor(Math.random() * (grid_size));
    coordinates.push([tile_x, tile_y])
    scenes.push({ stimulus: jsPsych.plugins['vsl-grid-scene'].generate_stimulus(update_scene(scene, [tile_x, tile_y]), [100, 100]) });
}

var back = [];
var stimulus_index = 0;
var trial = {
    type: 'html-keyboard-response',
    choices: [32],
    trial_duration: trial_duration,
    stimulus: jsPsych.timelineVariable('stimulus'),
    on_finish: function (data) {
        if (back.length < (num_back + 1)) {
            back = back.concat([coordinates[stimulus_index]]);
        } else {
            back = update_array(back, coordinates[stimulus_index]);
        }
        if (back.length > num_back) {
            if (back[back.length - 1][0] == back[0][0] && back[back.length - 1][1] == back[0][1]) {
                if (data.key_press) {
                    console.log("Correct!");
                } else {
                    console.log("You missed the repetition!");
                };    
            } else {
                console.log("Incorrect!")
            }
        } else {
            if (data.key_press) {
                console.log("Incorrect!");
            }
        }
        stimulus_index += 1;
    }
}

var trials = {
    timeline: [trial],
    timeline_variables: scenes,
}

jsPsych.init({
    timeline: [trials],
    on_finish: function () { jsPsych.data.displayData(); },
});