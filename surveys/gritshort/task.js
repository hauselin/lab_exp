// DEFINE TASK (required)
const taskinfo = {
    type: 'survey', // 'task', 'survey', or 'study'
    uniquestudyid: 'gritshort', // unique task id: must be IDENTICAL to directory name
    desc: 'Duckworth 2009 grit short scale', // brief description of task
    condition: null, // experiment/task condition
    redirect_url: "/surveys/gritshort/viz" // set to false if no redirection required
};
var info_ = create_info_(taskinfo);  // initialize subject id and task parameters
const debug = false;  // true to print messages to console and display json results
var font_colour = "black";
var background_colour = "white";
set_colour(font_colour, background_colour);

// DEFINE TASK PARAMETERS (required)
var slider_width = 500; // width of slider in pixels
var scale_min_max = [1, 5]; // slider min max values
var scale_starting_points = [2, 3, 4]; // starting point of scale; if length > 1, randomly pick one for each scale item
var scale_labels = ['not at all like me', 'very much like me']
var step = 0.01; // step size of scale
var require_movement = false; // whether subject must move slider before continuig
var shuffle_items = true; // randomize order of item presentation

jsPsych.data.addProperties({ // do not edit this section unnecessarily!
    subject: info_.subject,
    type: taskinfo.type,
    uniquestudyid: taskinfo.uniquestudyid,
    desc: taskinfo.desc,
    condition: taskinfo.condition,
});

// create experiment objects and timeline
var instructions = {
    type: "instructions",
    pages: [
        generate_html("Welcome!", font_colour, 25, [0, 0]) + generate_html("You're going to read several statements. Please indicate how well each one describes you.", font_colour),
    ],
    show_clickable_nav: true,
    show_page_number: false,
};

var start_point;  // to specify scale starting point on each trial
var procedure = {
    timeline: [{
        type: 'html-slider-response',
        stimulus: function () {
            return generate_html(jsPsych.timelineVariable('desc', true), font_colour);
        },   
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
    timeline_variables: items, // items come from environment variable in items.js
    randomize_order: shuffle_items
};


















// create timeline (order of events)
var timeline = [];
var html_path = "../../surveys/gritshort/consent.html";  // make it a global variable
timeline = create_consent(timeline, html_path);
timeline = check_same_different_person(timeline);
timeline.push(instructions);
timeline.push(procedure);
timeline = create_demographics(timeline);

// run task
jsPsych.init({
    timeline: timeline,
    on_finish: function () {
        document.body.style.backgroundColor = 'white';
        var datasummary = summarize_data();

        jsPsych.data.get().addToAll({ 
            total_time: jsPsych.totalTime() / 60000,
        });
        jsPsych.data.get().first(1).addToAll({ 
            info_: info_,
            datasummary: datasummary,
        });
        if (debug) {
            jsPsych.data.displayData();
        }

        info_.tasks_completed.push(taskinfo.uniquestudyid); // add uniquestudyid to info_
        info_.current_task_completed = 1;
        localStorage.setObj('info_', info_); 
        submit_data(jsPsych.data.get().json(), taskinfo.redirect_url); 
    }
});



















// functions to summarize data below
function preprocess_data() {  
    var data_sub = jsPsych.data.get().filter({ "trial_type": "html-slider-response" }); 
    var data_sub = data_sub.filterCustom(function (trial) { return trial.q > 0 });
    var data_sub = data_sub.filterCustom(function (trial) { return trial.rt > 200 });
    return data_sub;
}

function summarize_data() {
    var d = preprocess_data(); // get preprocess/clean data

    // select trials for each subscale
    var consistent_interest = d.filter({ "subscale": "consistentInterest" });
    var persevere_effort = d.filter({ "subscale": "persevereEffort" });

    // mean resp
    var consistent_resp = consistent_interest.select('resp_reverse').mean();
    var persevere_resp = persevere_effort.select('resp_reverse').mean();
    var mean_resp = d.select('resp_reverse').mean();

    // store above info in array
    var datasummary = [
        { type: "consistent_interest", param: "resp", value: consistent_resp },
        { type: "persevere_effort", param: "resp", value: persevere_resp },
        { type: "all", param: "resp", value: mean_resp },
    ];

    // add id/country information
    datasummary.forEach(function (s) {
        s.subject = info_.subject;
        s.country = info_.demographics.country;
        s.country_code = info_.demographics.country_code;
        s.total_time = jsPsych.totalTime() / 60000;
        s.time = info_.time;
    })
    console.log(datasummary);
    return datasummary
}