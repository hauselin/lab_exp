// DEFINE TASK (required)
const taskinfo = {
    type: 'survey', // 'task', 'survey', or 'study'
    uniquestudyid: 'crt', // unique task id: must be IDENTICAL to directory name
    description: 'cognitive reflection', // brief description of task
    condition: null, // experiment/task condition
    redirect_url: "/surveys/crt/viz" // set to false if no redirection required
};
var info_ = create_info_(taskinfo);  // initialize subject id and task parameters
const debug = false;  // true to print messages to console and display json results
var font_colour = "black";
var background_colour = "white";
set_colour(font_colour, background_colour);

// DEFINE TASK PARAMETERS (required)
acc_vals = [-1, 0, 1]

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
        generate_html("Welcome!", font_colour, 25, [0, 0]) + generate_html("You're going to read a few problems and questions. Try to answer as accurately as possible.", font_colour),
    ],
    show_clickable_nav: true,
    show_page_number: false,
};

var procedure = {
    timeline: [{
        type: 'survey-text',
        autocorrect: false,
        questions: [
            {prompt: jsPsych.timelineVariable('desc'), columns: 20, required: true, name: jsPsych.timelineVariable('q'), placeholder: ""}
        ],
        data: {
            question: jsPsych.timelineVariable('q'),
            question: jsPsych.timelineVariable('desc'),
            subscale: jsPsych.timelineVariable('subscale'),
            reverse: jsPsych.timelineVariable('reverse'),
            answer_correct: jsPsych.timelineVariable('answer_correct'),
            answer_intuitive: jsPsych.timelineVariable('answer_intuitive'),

        },
        on_finish: function (data) {
            var resp = JSON.parse(data.responses)
            var question = Object.keys(resp)[0]
            var clean_resp = resp[question].split(" ").join('');
            var resp_convert = clean_resp.toLowerCase();
            data.response_text = resp_convert;
            console.log('Response: ', data.response_text);

            var corr_ans_lower = data.answer_correct.toLowerCase();
            var int_ans_lower = data.answer_intuitive.toLowerCase();
            
            if (resp_convert == corr_ans_lower) {
                data.acc = acc_vals[2]
            }
            else if (resp_convert == int_ans_lower) {
                data.acc = acc_vals[1]
            }
            else { 
                data.acc = acc_vals[0]
            }
            console.log('Accuracy: ', data.acc);
        }
    }], 
    timeline_variables: items
}




// create timeline and events/objects for study (the first next lines are always the same! consent then check whether it's same person)
var timeline = [];
timeline = create_consent(timeline, taskinfo);
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

        jsPsych.data.get().first(1).addToAll({ 
            info_: info_,
            datasummary: datasummary,
        });
        
        info_.tasks_completed.push(taskinfo.uniquestudyid);
        info_.current_task_completed = 1;
        localStorage.setObj('info_', info_); 

        submit_data(jsPsych.data.get().json(), taskinfo.redirect_url); 
        if (debug) {
            jsPsych.data.displayData();
        }
    }
});

// functions to summarize data below
function preprocess_data() {  
    var data_sub = jsPsych.data.get().filter({ "trial_type": "survey-text" }); 
    var data_sub = data_sub.filterCustom(function (trial) { return trial.trial_index > 0 });
    var data_sub = data_sub.filterCustom(function (trial) { return trial.rt > 200 });
    return data_sub;
}

function summarize_data() {
    var d = preprocess_data(); // get preprocess/clean data

    var mean_acc = d.select('acc').mean();

    var acc_array = d.select('acc').values;
    acc_array = acc_array.map(function(a) {
        if (a == 1) {
            return 1
        } else {
            return 0
        }
    })
    var mean_cor = acc_array.reduce((a, b) => a + b, 0) / acc_array.length


    datasummary = {};
    datasummary.total_time = jsPsych.totalTime() / 60000;
    datasummary.subject = info_.subject;
    datasummary.country = info_.demographics.country;
    datasummary.country_code = info_.demographics.country_code;
    datasummary.time = info_.time;
    datasummary.mean_acc = mean_acc;
    datasummary.mean_cor = mean_cor;
    return datasummary;
}