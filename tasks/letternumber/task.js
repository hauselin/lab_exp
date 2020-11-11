const taskinfo = {
    type: 'task', // 'task', 'survey', or 'study'
    uniquestudyid: 'letternumber', // unique task id: must be IDENTICAL to directory name
    desc: 'letter number task', // brief description of task
    condition: null, // experiment/task condition
    redirect_url: false // set to false if no redirection required
};

var info_ = create_info_(taskinfo);  // initialize subject id and task parameters
var datasummary_ = create_datasummary_(info_); // initialize datasummary object

const debug = true;  // debug mode to print messages to console and display json data at the end
const black_background = false; // if true, white text on black background
var font_colour = 'black';
if (black_background) {
    document.body.style.backgroundColor = "black";
    var font_colour = 'white';
}

// TASK PARAMETERS
const vowels = ["A", "E", "I", "O", "U"];
const consonants = ["C", "D", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "V", "W", "X", "Y", "Z"];
const nums = [0, 1, 2, 3, 4, 6, 7, 8, 9];
const trials = 3;               // the total number of trials 
const max_tasktime_minutes = 5;   // maximum task time in minutes (task ends after this amount of time regardless of how many trials have been completed)
var reps = 5;                  // the number of symbols per trial
var difficulty = 1;   // task difficult (1, 2, 3, 4, or 5; 5 is most difficult)
var adaptive = true;  // adjust difficulty based on accuracy (true/false) (if true, reps and difficulty will be overwritten by difficulty_reps_steps[current_idx])
var show_performance = true;  // if true, also show subject counts on feedback page
var show_overall_performance = true; // whether to show overall performance at the end

// add data to all trials
jsPsych.data.addProperties({
    subject: info_.subject,
    type: taskinfo.type,
    uniquestudyid: taskinfo.uniquestudyid,
    desc: taskinfo.desc,
    condition: taskinfo.condition,
    info_: info_,
    datasummary_: datasummary_
});

var trial = {
    type: "html-keyboard-response",
    prompt: generate_html("Press the <b>c</b> or <b>v</b> letter keys to indicate your choice of a consonant or vowel, respectively.", font_colour, 18, [0, -160]),
    choices: ['c', 'v'],
    timeline: [{
        stimulus: function () {
            var str1 = random_choice(random_choice(shuffle(vowels), shuffle(consonants)));
            var str2 = random_choice(nums)
            var ans = str1 + str2
            var text = generate_html(ans, font_colour, 30);
            return text;
        },
    }],
    repetitions: trials_per_cost * costs.length,
    on_finish: function (data) {
        data.event = 'choice';
        data.cost = costs[n_cost];
        data.n_cost = n_cost;
        data.large_reward = large_reward;
        data.small_reward = small_reward;
        data.n_trial = n_trial;
        data.n_trial_overall = n_trial_overall;
        data.key_press = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(data.key_press);
        n_trial += 1;
        n_trial_overall += 1;
        if (data.key_press == 'leftarrow') {
            if (reverse_sides) {
                reward_window[1] = small_reward;
                data.choice = 0; // 0: smaller reward chosen, 1: larger reward chosen
            } else {
                reward_window[0] = small_reward;
                data.choice = 1;
            }
        }
        else if (data.key_press == 'rightarrow') {
            if (reverse_sides) {
                reward_window[0] = small_reward;
                data.choice = 1;
            } else {
                reward_window[1] = small_reward;
                data.choice = 0;
            }
        }
        data.reward_window = [reward_window[0], reward_window[1]];
        indifference = (reward_window[0] + reward_window[1]) / 2;
        data.indifference = indifference;
        data.indifference_ratio = indifference / large_reward;
        if (n_trial == trials_per_cost) { // after 5 trials, move to next cost/delay
            n_trial = 0; // reset trial counter
            n_cost += 1;
            reward_window = [0, large_reward]; // reset reward window
        };
        if (debug) {
            console.log('this trial indifference: ' + indifference);
            console.log('next trial cost: ' + costs[n_cost]);
            console.log('next trial reward window: ' + reward_window);
        };
    }
};


// create timeline (order of events)
var timeline = [];
const html_path = "../../tasks/delaydiscount/consent.html";
timeline = create_consent(timeline, html_path);
timeline = check_same_different_person(timeline);
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
            stimuli_sides: stimuli_sides
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
    datasummary.trials_per_cost = trials_per_cost;
    datasummary.auc = get_auc();
    datasummary.total_time = jsPsych.totalTime() / 60000;
    return datasummary;
}