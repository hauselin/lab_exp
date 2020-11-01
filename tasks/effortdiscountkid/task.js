const taskinfo = {
    type: 'task', // 'task', 'survey', or 'study'
    uniquestudyid: 'effortdiscountkid', // unique task id: must be IDENTICAL to directory name
    desc: 'effort discounting task for kids', // brief description of task
    condition: null, // experiment/task condition
    redirect_url: false //"/tasks/effortdiscountkid/viz" // set to false if no redirection required
};

var info_ = create_info_(taskinfo);

const debug = false;  // debug mode to print messages to console and display json data at the end
var font_colour = "black";
var background_colour = "white";
set_colour(font_colour, background_colour);

// TASK PARAMETERS
var stars = 25;
var star = "&#11088";
var alien = "&#x1F479";
const large_reward = 25; //Large reward after cost.
var costs = [1, 2, 3, 4, 5];  //costs in aliens.
// var costs = [2, 5]; // I tend to use fewer when debugging (so the task finishes faster)
const trials_per_cost = 6; //Number of trials per cost/delays.
const practice_trials = 3; //Number of practice trials.

// parameters below typically don't need to be changed
var small_reward = null;  //Small reward without cost.
const quantile_range = [0.40, 0.60] //Quantiles within window to draw values from.
costs = jsPsych.randomization.shuffle(costs);

var n_cost = 0;
var n_trial = 0;
var n_trial_overall = 0;
var reward_window = [1, large_reward];

var reverse_sides = Math.random() > 0.5; // randomly determine whether to switch large/small reward sides
var stimuli_sides = "left_large_right_small";
if (reverse_sides) {
    stimuli_sides = "left_small_right_large";
}

// add subject id and task info to all trials
jsPsych.data.addProperties({
    subject: info_.subject,
    type: taskinfo.type,
    uniquestudyid: taskinfo.uniquestudyid,
    desc: taskinfo.desc,
    condition: taskinfo.condition,    
});

// create experiment timeline
var timeline = [];
const html_path = "../../tasks/effortdiscountkid/consent.html";
timeline = create_consent(timeline, html_path);

var instructions = {
    type: "instructions",

    pages: [
        generate_html("Welcome!", font_colour, 25, [0, 0]) + generate_html("Press the right arrow key.", font_colour),
        generate_html("In this task, you'll have to decide which option you prefer.", font_colour) + generate_html("For example, you'll see two options:", font_colour) + gridCreator(25, 1, 12, 0, star, alien),
        generate_html("Catching more aliens means you get more stars!", font_colour) + generate_html("Use the left/right arrow keys on the keyboard to choose.", font_colour),
        generate_html("Next up is a practice trial.", font_colour) + generate_html("Your data will NOT be recorded.", font_colour) + generate_html("Click next or press the right arrow key to begin.", font_colour)
    ],
    show_clickable_nav: true,
    show_page_number: true,
};

var instructions2 = {
    type: "instructions",
    pages: [
        generate_html("That was the practice trial.", font_colour) + generate_html("Click next or press the right arrow key to begin the experiment.", font_colour) + generate_html("Your data WILL be recorded this time.", font_colour)
    ],
    show_clickable_nav: true,
    show_page_number: false,
};

var trial = {
    type: "html-keyboard-response",
    //prompt: generate_html("Press the <b>left</b> or <b>right</b> arrow key to indicate whether <br>you prefer the option on the left or right, respectively.", font_colour, 18, [0, -160]),
    choices: [37, 39],
    timeline: [{
        stimulus: function () {
            var lower = (reward_window[1] - reward_window[0]) * quantile_range[0] + reward_window[0];
            var upper = (reward_window[1] - reward_window[0]) * quantile_range[1] + reward_window[0];
            small_reward = random_min_max(lower, upper);
            var options = gridCreator(large_reward, costs[n_cost], small_reward, 0, star, alien);
            return options;
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
        if (n_trial == trials_per_cost) { // after 5 trials, move to next cost/delay
            n_trial = 0; // reset trial counter
            n_cost += 1;
            reward_window = [1, large_reward]; // reset reward window
        };
        if (debug) {
            console.log('this trial indifference: ' + indifference);
            console.log('next trial cost: ' + costs[n_cost]);
            console.log('next trial reward window: ' + reward_window);
        };
    }
};

// create practice trials
var practice_trial = jsPsych.utils.deepCopy(trial);
delete practice_trial.on_finish;
delete practice_trial.timeline;
practice_trial.repetitions = practice_trials;

practice_trial.timeline = [
    {
        stimulus: function () {
            var large_reward = 25;
            var small_reward = large_reward - Math.floor(Math.random() * large_reward);
            var text = gridCreator(large_reward, costs[Math.floor(Math.random() * 5)], small_reward.toFixed(2), 0, 
                                    star, alien);
            return text;
        }
    }];

practice_trial.on_finish = function (data) { data.event = 'practice'; };

// create task timeline
timeline.push(instructions);
timeline.push(practice_trial);
timeline.push(instructions2);
timeline.push(trial);

jsPsych.init({
    timeline: timeline,
    on_finish: function () {
        document.body.style.backgroundColor = 'white';
        var datasummary = summarize_data(); // summarize data
        info_.tasks_completed.push(info_.uniquestudyid); // add uniquestudyid to info_
        jsPsych.data.get().addToAll({ // add parameters to all trials
            total_time: datasummary.total_time,
            auc: datasummary.auc,
            stimuli_sides: stimuli_sides
        });
        jsPsych.data.get().first(1).addToAll({ // add objects to only first trial (to save space)
            info_: info_,
            datasummary: datasummary,
        });
        if (debug) {
            jsPsych.data.displayData();
        }
        sessionStorage.setObj('info_', info_); // save to sessionStorage
        submit_data(jsPsych.data.get().json(), taskinfo.redirect_url); // save data to database and redirect
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

function get_auc() {    //note that this area is an underestimation of the hyperbolic curve, as the width of the histogram bars are bounded by the lower cost and the entry's cost.
    var trial_data = jsPsych.data.get().filter({ n_trial: (trials_per_cost - 1), event: "choice" });
    var indifference_data = trial_data.select('indifference').values;
    var delayed_reward_data = trial_data.select('large_reward').values;
    var cost_data = trial_data.select('cost').values;
    var sorted_costs = cost_data.slice(0, cost_data.length).sort(function (a, b) { return a - b });  // sort a sliced copy of cost_data (try to keep things local as much as we can, so we avoid using the global costs variable) 
    
    // save values in datasummary
    datasummary.indifference = indifference_data;
    datasummary.delayed_reward = delayed_reward_data;
    datasummary.cost = cost_data;

    // compute area for each cost
    var bar_areas = [];
    for (i = 0; i < sorted_costs.length; i++) {
        var height = indifference_data[i] / delayed_reward_data[i]; // in this task, elements in delay_reward_data have the same value
        if (sorted_costs.indexOf(cost_data[i]) == 0) { // width of first (leftmost) bar
            var width = cost_data[i] / Math.max(...sorted_costs);
        } else {  // width of the second bar onwards 
            var width = (cost_data[i] - sorted_costs[sorted_costs.indexOf(cost_data[i]) - 1]) / Math.max(...sorted_costs);
        }
        bar_areas.push(width * height);
    }
    if (debug) {
        console.log(bar_areas);
    }
    return bar_areas.reduce(function (a, b) { // sum values in array
        return a + b;
    }, 0);
}

function helperfunction(obj_count, emoji) {
    var val = "";
    for (i=0; i<obj_count; i++) {
        // val += "<div class=obj style=border-radius:10px;padding:20px;font-size:150%;>" + emoji + "</div>";
        val += "<div>" + emoji + "</div>";
        console.log(val.length);
    }
    return val ;
}

function gridCreator(stars_1, aliens_1, stars_2, aliens_2, star, alien) {
    
    return "<div class=options style=display:grid;grid-template-columns:repeat(2,300px);>" + 
                "<div class=option_1 style=display:grid;grid-gap:1px;grid-template-columns:repeat(5,30px);grid-template-rows:repeat(5,30px);margin:auto;>" + 
                helperfunction(stars_1, star) + helperfunction(aliens_1, alien) + "</div>" +
                "<div class=option_2 style=display:grid;grid-gap:1px;grid-template-columns:repeat(5,30px);grid-template-rows:repeat(5,30px);margin:auto;margin-top:0>" + // TODO: Frank pls fix this!! :)
                helperfunction(stars_2, star) + helperfunction(aliens_2, alien) + "</div> </div>"

}