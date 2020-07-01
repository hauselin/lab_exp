var subject = jsPsych.randomization.randomID(15);
var slider_width = 500; // width of slider in pixels
var scale_min_max = [1, 5]; // slider min max values
var scale_starting_points = [2, 3, 4]; // starting point of scale; if length > 1, randomly pick one for each scale item
var step = 0.01; // step size of scale
var require_movement = false; // whether subject must move slider before they're allowed to click continue
var shuffle_items = false; // randomize order of item presentation
var debug = true;
var url = false;  // if this is false, no redirection occurs

var test_tasks = ['grit_short', 'bigfive_aspect'];
var test_labels = [['not at all like me', 'very much like me'], ['strongly disagree', 'neither agree nor disagree', 'strongly agree']]

for (var i = 0; i < test_tasks.length; i++) {
    Papa.parse('../surveys/' + test_tasks[i] + '.csv', {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function (results) {
            if (debug && test_tasks[i] == 'bigfive_aspect') {
                run_survey(results.data.slice(0, 3), test_tasks[i], test_labels[i]);
            } else {
                run_survey(results.data, test_tasks[i], test_labels[i]);
            }
        }
    });
}

// entire task is a (callback) function called by Papa.parse
function run_survey(survey, task, labels) {
    jsPsych.data.addProperties({
        subject: subject,
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
            labels: labels,
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
        timeline_variables: survey,
        randomize_order: shuffle_items
    };

    jsPsych.init({
        timeline: [procedure],
        on_finish: function () {
            jsPsych.data.addProperties({ total_time: jsPsych.totalTime() });
            submit_data(jsPsych.data.get().json(), url);
        }
    });
};