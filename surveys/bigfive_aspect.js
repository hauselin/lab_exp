var task = 'bigfive_aspect'; // must be identical to script name and csv file name
var slider_width = 500; // width of slider in pixels
var scale_min_max = [1, 5]; // slider min max values
var scale_starting_points = [2, 3, 4]; // starting point of scale; if length > 1, randomly pick one for each scale item
var scale_labels = ['strongly disagree', 'neither agree nor disagree', 'strongly agree'];
var step = 0.01; // step size of scale
var require_movement = false; // whether subject must move slider before they're allowed to click continue
var shuffle_items = false; // randomize order of item presentation
var debug = true;

Papa.parse('../surveys/' + task + '.csv', {
    download: true,
    header: true,
    dynamicTyping: true,
    complete: function (results) {
        if (debug) {
            run_survey(results.data.slice(0,3));
        }
        else {
            run_survey(results.data);
        }
    }
});

function run_survey(survey) {
    jsPsych.data.addProperties({
        task: task,
        browser: navigator.userAgent, // browser info
        datetime: Date(),
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
        }]
    }
}