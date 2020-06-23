var task = 'grit_short';
var slider_width = 500; // width of slider in pixels
var scale_min_max = [1, 5]; // slider min max values
var scale_starting_points = [2, 3, 4]; // starting point of scale; if length > 1, randomly pick one for each scale item
var scale_labels = ['not at all like me', 'very much like me']
var step = 0.01; // step size of scale
var require_movement = false; // whether subject must move slider before they're allowed to click continue


// read survey csv file
// https://www.papaparse.com
var survey;
Papa.parse('../surveys/' + task + '.csv', {
    download: true, 
    header: true, 
    dynamicTyping: true,
    complete: function (results) { 

        survey = results.data;

        jsPsych.data.addProperties({
            task: task,
            browser: navigator.userAgent, // browser info
            datetime: Date(),
        });

        var grit_procedure = {
            timeline: [
                {
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
                    start: function () { return jsPsych.randomization.sampleWithoutReplacement(scale_starting_points, 1)[0] },
                    step: step,
                    require_movement: require_movement,
                    on_finish: function(data) {
                        data.response = Number(data.response)
                        data.resp_reverse = scale_min_max[1] + 1 - data.response
                    }
                }
            ],
        
            timeline_variables: survey
        };
        
        jsPsych.init({
            timeline: [grit_procedure],
            on_finish: function () {
                jsPsych.data.displayData();
                jsPsych.data.addProperties({ total_time: jsPsych.totalTime() });
                $.ajax({
                    type: "POST",
                    url: "/submit-data",
                    data: jsPsych.data.get().json(),
                    contentType: "application/json"
                })
                jsPsych.data.displayData();
            }
        })
        
    }
});

