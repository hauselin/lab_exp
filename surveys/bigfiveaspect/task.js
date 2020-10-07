const taskinfo = {
    type: 'survey', // 'task', 'survey', or 'study'
    uniquestudyid: 'bigfiveaspect', // unique task id: must be IDENTICAL to directory name
    desc: 'DeYoung 2007 big five aspects scale', // brief description of task
    condition: null, // experiment/task condition
    redirect_url: false // set to false if no redirection required
};

var info_ = create_info_(taskinfo);  // initialize subject id and task parameters

const debug = false;  // debug mode to print messages to console and display json data at the end
const black_background = false; // if true, white text on black background
var font_colour = 'black';
if (black_background) {
    document.body.style.backgroundColor = "black";
    var font_colour = 'white';
}

if (true) {
    items = items.slice(0, 60);
}

// TASK PARAMETERS
var slider_width = 500; // width of slider in pixels
var scale_min_max = [1, 5]; // slider min max values
var scale_starting_points = [2, 3, 4]; // starting point of scale; if length > 1, randomly pick one for each scale item
var scale_labels = ['strongly disagree', 'neither agree nor disagree', 'strongly agree'];
var step = 0.01; // step size of scale
var require_movement = false; // whether subject must move slider before they're allowed to click continue
var shuffle_items = false; // randomize order of item presentation

// add data to all trials
jsPsych.data.addProperties({
    subject: info_.subject,
    type: taskinfo.type,
    uniquestudyid: taskinfo.uniquestudyid,
    desc: taskinfo.desc,
    condition: taskinfo.condition,
    info_: info_,
});

var start_point;
var procedure = {
    timeline: [{
        type: 'html-slider-response',
        stimulus: jsPsych.timelineVariable('desc'),
        data: {
            q: jsPsych.timelineVariable('q'),
            subscale: jsPsych.timelineVariable('subscale'),
            reverse: jsPsych.timelineVariable('reverse')
        },
        labels: scale_labels,
        slider_width: slider_width,
        min: scale_min_max[0],
        max: scale_min_max[1],
        start: function () {
            start_point = jsPsych.randomization.sampleWithoutReplacement(scale_starting_points, 1)[0];
            return start_point;
        },
        step: step,
        require_movement: require_movement,
        on_finish: function (data) {
            data.start_point = start_point;
            data.resp = Number(data.response);
            data.resp_reverse = data.resp;
            if (data.reverse) { // reverse code item if necessary
                data.resp_reverse = scale_min_max[1] + 1 - data.resp;
            }
            if (debug) {
                console.log("q" + data.q + " (reverse: " + data.reverse + "): " + data.stimulus);
                console.log("resp: " + data.resp + ", resp_reverse: " + data.resp_reverse);
            }
        }
    }],

    timeline_variables: items,
    randomize_order: shuffle_items
};

// create timeline and add consent form to the start
var timeline = [];
timeline.push(procedure);

jsPsych.init({
    timeline: timeline,
    on_finish: function () {
        document.body.style.backgroundColor = 'white';
        info_.tasks_completed.push(info_.uniquestudyid); // add uniquestudyid to info_
        jsPsych.data.get().addToAll({ // add objects to all trials
            info_: info_,
        });
        if (debug) {
            jsPsych.data.displayData();
        }
        sessionStorage.setObj('info_', info_); // save to sessionStorage
        submit_data(jsPsych.data.get().json(), taskinfo.redirect_url); // save data to database and redirect
    }
});






