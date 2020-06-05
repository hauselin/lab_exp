var subject = jsPsych.randomization.randomID(15); // random character subject id
var condition = 'control'; // experiment/task condition
var task = 'delay discounting';
var experiment = 'delay discounting';
var debug = false;

// var itis = iti_exponential(low = 300, high = 800);  // generate array of ITIs
const large_reward = 100; //Large reward after cost.
const quantile_range = [0.40, 0.60] //Quantiles within window to draw values from.
const trials_per_cost = 5; //Number of trials per cost/delays.

var small_reward = null;  //Small reward without cost.
var costs = [2, 10, 15, 50, 100];  //costs in days.
// var costs = [2, 10]; // I tend to use fewer when debugging (so the task finishes faster)
costs = jsPsych.randomization.shuffle(costs);

// parameters below typically don't need to be changed
var n_cost = 0;
var n_trial = 0;
var n_trial_overall = 0;
var reward_window = [0, large_reward];

// add data to all trials
jsPsych.data.addProperties({
    subject: subject,
    condition: condition,
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
    pages: ["Welcome!<p>Click next or press the right arrow key to proceed.</p>", "<p>In this task, you'll have to decide which option you prefer.</p><p>For example, you'll see two options: $30.00 in 3 days or $2.40 in 0 days (today).</p><p>Choosing $30 days in 3 days means you'll wait 3 days so you can get $30. Choosing $2.40 means you will receive $2.40 today.</p><p>You'll use the left/right arrow keys on the keyboard to indicate which option you prefer (left or right option, respectively).</p>", "Click next or press the right arrow key to begin."],
    show_clickable_nav: true,
    show_page_number: true,
}; timeline.push(instructions);

var trial = {
    type: "html-keyboard-response",
    prompt: '<div style="transform: translateY(-130px); font-size: 15px;"> Press the <b>left</b> or <b>right</b> arrow key to indicate whether <br>you prefer the option on the left or right, respectively. </div>',
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
            var text = text_left + text_or + text_right;
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
        data.keypress = 'left'; //TODO: convert to keycode
        n_trial += 1;
        n_trial_overall += 1;
        if (data.key_press == 37) {
            reward_window[0] = small_reward;
        }
        else if (data.key_press == 39) {
            reward_window[1] = small_reward;
        }
        data.reward_window = [reward_window[0], reward_window[1]];
        indifference = (reward_window[0] + reward_window[1]) / 2;
        data.indifference = indifference;
        if (debug) {
            console.log(costs[n_cost]);
            console.log(reward_window);
        }
        if (n_trial == trials_per_cost) { // after 5 trials, move to next cost/delay
            n_trial = 0; // reset trial counter
            n_cost += 1;
            reward_window = [0, large_reward]; // reset reward window
        }
    }
}; timeline.push(trial);

jsPsych.init({
    timeline: timeline,
    on_finish: function () {
        jsPsych.data.displayData('csv');
    }
});