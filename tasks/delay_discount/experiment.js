const dark_background = false;
var subject = jsPsych.randomization.randomID(15); // random character subject id
var condition = 'control'; // experiment/task condition
var task = 'delay discounting';
var experiment = 'delay discounting';
var debug = false;

// var itis = iti_exponential(low = 300, high = 800);  // generate array of ITIs
const large_reward = 100; //Large reward after cost.
var costs = [2, 10, 15, 50, 100, 100];  //costs in days.
// var costs = [2, 10]; // I tend to use fewer when debugging (so the task finishes faster)
const trials_per_cost = 6; //Number of trials per cost/delays.

// parameters below typically don't need to be changed
var small_reward = null;  //Small reward without cost.
const quantile_range = [0.40, 0.60] //Quantiles within window to draw values from.
costs = jsPsych.randomization.shuffle(costs);

var n_cost = 0;
var n_trial = 0;
var n_trial_overall = 0;
var reward_window = [0, large_reward];

if (dark_background) {
    // background_colour = "black";
    document.body.style.backgroundColor = "black";
    font_colour = "white";
} else if (!dark_background) {
    // background_colour = "white";
    document.body.style.backgroundColor = "white";
    font_colour = "black";
};

// add data to all trials
jsPsych.data.addProperties({
    subject: subject,
    condition: condition,
    task: task,
    experiment: experiment,
    browser: navigator.userAgent, // browser info
    datetime: Date(),
});

var timeline = [];

timeline.push({
    type: "fullscreen",
    fullscreen_mode: false
});

var instructions = {
    type: "instructions",
    pages: ["<p style='color: " + font_colour + "'>Welcome!</p><p style='color: " + font_colour + "'>Click next or press the right arrow key to proceed.</p>", "<p style='color: " + font_colour + "'>In this task, you'll have to decide which option you prefer.</p><p style='color: " + font_colour + "'>For example, you'll see two options: $30.00 in 3 days or $2.40 in 0 days (today).</p><p style='color: " + font_colour + "'>Choosing $30 days in 3 days means you'll wait 3 days so you can get $30. Choosing $2.40 means you will receive $2.40 today.</p><p style='color: " + font_colour + "'>You'll use the left/right arrow keys on the keyboard to indicate which option you prefer (left or right option, respectively).</p>", "<p style='color: " + font_colour + "'>Click next or press the right arrow key to begin.</p>"],
    show_clickable_nav: true,
    show_page_number: true,
}; timeline.push(instructions);

var trial = {
    type: "html-keyboard-response",
    prompt: "<div style='transform: translateY(-130px); font-size: 15px; color: " + font_colour + "'> Press the <b>left</b> or <b>right</b> arrow key to indicate whether <br>you prefer the option on the left or right, respectively. </div>",
    choices: [37, 39],
    // post_trial_gap: random_choice(itis),
    timeline: [{
        stimulus: function () {
            var lower = (reward_window[1] - reward_window[0]) * quantile_range[0] + reward_window[0];
            var upper = (reward_window[1] - reward_window[0]) * quantile_range[1] + reward_window[0];
            small_reward = math.random(lower, upper);

            var text_left = "$" + large_reward.toFixed(2) + " in " + costs[n_cost] + " days";
            if (n_trial == 0) { // bold and change color of left option on first trial of each cost/delay
                var text_left = "<b><font color='#317EF3'>" + text_left + "</font></b>"
            };
            var text_or = "&nbsp;&nbsp;&nbsp; or &nbsp;&nbsp;&nbsp;";
            var text_right = "$" + small_reward.toFixed(2) + " in 0 days";
            var text = "<font style='color: " + font_colour + "'>" + text_left + text_or + text_right + "</font>";
            return text;
        },
    }],
    repetitions: trials_per_cost * costs.length,
    on_finish: function (data) {
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
            reward_window[0] = small_reward;
        }
        else if (data.key_press == 'rightarrow') {
            reward_window[1] = small_reward;
        }
        data.reward_window = [reward_window[0], reward_window[1]];
        indifference = (reward_window[0] + reward_window[1]) / 2;
        data.indifference = indifference;
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
}; timeline.push(trial);


jsPsych.init({
    timeline: timeline,
    on_finish: function () {
        jsPsych.data.addProperties({ total_time: jsPsych.totalTime() });
        $.ajax({
            type: "POST",
            url: "/submit-data",
            data: jsPsych.data.get().json(),
            contentType: "application/json"
        })
        jsPsych.data.get().addToAll({ auc: get_auc() });
        jsPsych.data.displayData();
        // var all_data = jsPsych.data.get().filter({trial_type: 'html-keyboard-response'}).localSave('json','data.json');
    }
});

function get_auc() {    //note that this area is an underestimation of the hyperbolic curve, as the width of the histogram bars are bounded by the lower cost and the entry's cost.
    // var curve_data = jsPsych.data.get().filter({trial_type: 'html-keyboard-response'}).ignore('rt').ignore('stimulus').ignore('key_press').ignore('trial_type').ignore('trial_index').ignore('time_elapsed').ignore('internal_node_id').ignore('subject').ignore('condition').ignore('task').ignore('experiment').ignore('browser').ignore('datetime').ignore('n_cost').ignore('large_reward').ignore('n_trial').ignore('n_trial_overall').ignore('reward_window').ignore('total_time');
    // console.log(curve_data.localSave('csv','data.csv'));
    var trial_data = jsPsych.data.get().filter({ n_trial: (trials_per_cost - 1) });
    var indifference_data = trial_data.select('indifference').values;
    var delayed_reward_data = trial_data.select('large_reward').values;
    var cost_data = trial_data.select('cost').values;
    var sorted_costs = cost_data.slice(0, cost_data.length).sort(function (a, b) { return a - b });  // sort a sliced copy of cost_data (try to keep things local as much as we can, so we avoid using the global costs variable) 
    var bar_areas = [];
    // compute area for each cost
    for (i = 0; i < sorted_costs.length; i++) {
        var height = indifference_data[i] / delayed_reward_data[i]; // in this task, elements in delay_reward_data have the same value
        if (sorted_costs.indexOf(cost_data[i]) == 0) { // width of first (leftmost) bar
            var width = cost_data[i] / Math.max(...sorted_costs);
        } else {  // width of the second bar onwards 
            var width = (cost_data[i] - sorted_costs[sorted_costs.indexOf(cost_data[i]) - 1]) / Math.max(...sorted_costs);
        }
        bar_areas.push(width * height);
    }
    console.log(bar_areas);
    return bar_areas.reduce(function (a, b) { // sum values in array
        return a + b;
    }, 0);
}