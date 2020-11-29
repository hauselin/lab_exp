const taskinfo = {
    type: 'task', // 'task', 'survey', or 'study'
    uniquestudyid: 'letternumber', // unique task id: must be IDENTICAL to directory name
    desc: 'letter number task', // brief description of task
    condition: null, // experiment/task condition
    redirect_url: false // set to false if no redirection required
};

var info_ = create_info_(taskinfo);  // initialize subject id and task parameters
//var datasummary_ = create_datasummary_(info_); // initialize datasummary object
const debug = false;
var font_colour = "black";
var background_colour = "white";
set_colour(font_colour, background_colour);

// TASK PARAMETERS
const vowels = ["A", "E", "U"];
const consonants = ["C", "D", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "V", "W", "X", "Y", "Z"];
const nums = [1, 2, 3, 4, 6, 7, 8, 9];
const trials = 1;               // the total number of trials
var reps = 12;                  // number of combinations per trial
const max_tasktime_minutes = 5;   // maximum task time in minutes (task ends after this amount of time regardless of how many trials have been completed)
var adaptive = true;  // adjust difficulty based on accuracy (true/false) (if true, reps and difficulty will be overwritten by difficulty_reps_steps[current_idx])
var show_overall_performance = true; // whether to show overall performance at the end
var n_trial = -1; // current trial number counter
var n_rep = 0; // current rep counter
var responses = [];  // subject's response on each trial $ and #
var switch_intensity = { 1: 2.4, 2: 2.2, 3: 1.8, 4: 1.5, 5: 1.3 } // task difficulty parameters
var difficulty = 1; 

// Lines 32 - 44 generate the binary sequence and creates a combination of letter/numbers based on the binary sequence
var arr = [];
var sequence = []
for (var i=0;i<=reps;i++) {
    arr.push(Math.round(Math.random()))
}
for (i=0;i<=reps;i++){
    var combo = random_choice(shuffle(vowels.concat(consonants)))+random_choice(nums)
    if (arr[i] == 1) {
        if (vowels.includes(combo[0])) {
            sequence.push({obj: combo, desc: 'Letter', ans: 'v'})
        }
        else {
            sequence.push({obj: combo, desc: 'Letter', ans: 'c'})
        }
    }
    else {
        if (parseInt(combo[1]) > 5) {
            sequence.push({obj: combo, desc: 'Number', ans: 'v'})
        } else {
            sequence.push({obj: combo, desc: 'Number', ans: 'c'})
        }
    }
}

console.log(arr);
console.log(sequence);

// add data to all trials
jsPsych.data.addProperties({
    subject: info_.subject,
    type: taskinfo.type,
    uniquestudyid: taskinfo.uniquestudyid,
    desc: taskinfo.desc,
    condition: taskinfo.condition,
    // datasummary_: datasummary_
});

var instructions = {
    type: "instructions",
    pages: ["Welcome!<p>Click next or press the right arrow key to proceed.</p>", "<p>In this task, you'll see combinations of letters and numbers. <p>Your goal is to identify if a letter is a vowel, or if a number is less than or greater than 5.</p>", "Click next or press the right arrow key to begin."],
    show_clickable_nav: true,
    show_page_number: true,
}; 

var trial = {
    timeline: [{
        type: 'html-keyboard-response', 
        stimulus: function(){
            var html="<p>" + jsPsych.timelineVariable('desc', true) +"</p>";
            html += "<p>" + jsPsych.timelineVariable('obj', true) +"</p>";
            return html;
        },
        choices: ['c', 'v']
    }],
    timeline_variables: sequence, 
    on_finish: function(data) {
        console.log(data.key_press);
    }
}

// create timeline (order of events)
var timeline = [];
const html_path = "../../tasks/letternumber/consent.html";
timeline = create_consent(timeline, html_path);
timeline = check_same_different_person(timeline);
timeline.push(instructions)
timeline.push(trial);
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


