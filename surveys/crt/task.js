// DEFINE TASK (required)
const taskinfo = {
    type: 'survey', // 'task', 'survey', or 'study'
    uniquestudyid: 'crt', // unique task id: must be IDENTICAL to directory name
    desc: 'cognitive reflection', // brief description of task
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
timeline = []

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
        generate_html("Welcome!", font_colour, 25, [0, 0]) + generate_html("You're going to read several brain teasers. Try to solve them!", font_colour),
    ],
    show_clickable_nav: true,
    show_page_number: false,
};

timeline.push(instructions);

var procedure = {
    timeline: [{
        type: 'survey-text',
        questions: [
            {prompt: jsPsych.timelineVariable('desc'), columns: 20, required: true, name: jsPsych.timelineVariable('q'), placeholder: "Your answer here."}
        ],
        data: {
            question: jsPsych.timelineVariable('q'),
            subscale: jsPsych.timelineVariable('subscale'),
            reverse: jsPsych.timelineVariable('reverse'),
            answer_correct: jsPsych.timelineVariable('answer_correct'),
            answer_intuitive: jsPsych.timelineVariable('answer_intuitive'),

        },
        on_finish: function (data) {
            resp = JSON.parse(data.responses)
            question = Object.keys(resp)[0]
            clean_resp = resp[question].split(" ").join('');
            resp_convert = clean_resp.toLowerCase();
            corr_ans_lower = data.answer_correct.toLowerCase();
            int_ans_lower = data.answer_intuitive.toLowerCase();
            
            var obj = {}
            obj["question"] = question
            obj["response"] = resp_convert
            
            if (resp_convert == corr_ans_lower) {
                obj["acc"] = acc_vals[2]
            }
            else if (resp_convert == int_ans_lower) {
                obj["acc"] = acc_vals[1]
            }
            else { 
                obj["acc"] = acc_vals[0]
            }

            data.resps = obj
            console.log(data.resps)
            data.resp_reverse = data.resp;
            if (debug) {
                console.log("q" + data.q + " (reverse: " + data.reverse + "): " + data.stimulus);
                console.log("resp: " + data.resp + ", resp_reverse: " + data.resp_reverse);
            }
        }
    }], 
    timeline_variables: items
}




// create timeline (order of events)
var timeline = [instructions, procedure];
const html_path = "../../surveys/crt/consent.html";
timeline = create_consent(timeline, html_path);
timeline = check_same_different_person(timeline);
timeline = create_demographics(timeline);

// run task
jsPsych.init({
    timeline: timeline,
    on_finish: function () {
        document.body.style.backgroundColor = 'white';
        var datasummary = summarize_data(); 

        jsPsych.data.get().addToAll({ // add parameters to all trials
            total_time: jsPsych.totalTime() / 60000,
            auc: datasummary.auc,
        });
        jsPsych.data.get().first(1).addToAll({ 
            info_: info_,
            datasummary: datasummary,
        });
        if (debug) {
            jsPsych.data.displayData();
        }
        
        info_.tasks_completed.push(taskinfo.uniquestudyid);
        info_.current_task_completed = 1;
        localStorage.setObj('info_', info_); 
        submit_data(jsPsych.data.get().json(), taskinfo.redirect_url); 
    }
});

// functions to summarize data below
function summarize_data() {
    datasummary = {};
    datasummary.total_time = jsPsych.totalTime() / 60000;
    return datasummary;
}