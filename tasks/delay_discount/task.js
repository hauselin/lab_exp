const dark_background = false;
var condition = 'control'; // experiment/task condition
var task = 'delay discounting';
var experiment = 'delay discounting';
var debug = true;
var fullscreen = false;

// var itis = iti_exponential(low = 300, high = 800);  // generate array of ITIs
const large_reward = 100; //Large reward after cost.
var costs = [2, 10, 15, 50, 100];  //costs in days.
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
    document.body.style.backgroundColor = "black";
    font_colour = "white";
} else if (!dark_background) {
    document.body.style.backgroundColor = "white";
    font_colour = "black";
};

var reverse_sides = Math.random() > 0.5; // randomly determine whether to switch large/small reward sides
var stimuli_sides = "left_large_right_small";
if (reverse_sides) {
    stimuli_sides = "left_small_right_large";
}

date = new Date();
var info_ = {
    subject: "",
    condition: condition,
    datetime: date,
    timezone: date.getTimezoneOffset(), // return the time zone difference, in minutes, from current locale (host system settings) to UTC
    platform: navigator.platform, // most browsers, including Chrome, Edge, and Firefox 63 and later, return "Win32" even if running on a 64-bit version of Windows. Internet Explorer and versions of Firefox prior to version 63 still report "Win64"
    browser: navigator.userAgent, // browser info
    // TODO FRANK: works for me now! It's the way I've set up my Firefox (it disables this kind of tracking by preventing the plugin from even loading!) so make sure to use try/catch to make sure the code below works even when the geolocation plugin hasn't been loaded.
    ip: geoplugin_request(),
    city: geoplugin_city(),
    region: geoplugin_region(),
    country_name: geoplugin_countryName(),
};

// save subject info
if (get_query_string().hasOwnProperty('subject')) {
    // sessionStorage.setItem('subject', get_query_string().subject); // TODO Frank; save in info_ object (create empty info_ and datasummary_ objects above first)
    var subject = get_query_string().subject;
    if (debug) {
        console.log('There was url subject ID variable: ' + subject);
    }
} else if (sessionStorage.getItem('subject')) {
    var subject = sessionStorage.getItem('subject');
    if (debug) {
        console.log('There was no url subject ID variable but there was subject ID in sessionStorage: ' + subject);
    }
} else {
    var subject = jsPsych.randomization.randomID(15); // random character subject id
    if (debug) {
        console.log('There was no url subject ID variable or subject ID in sessionStorage, hence the subject ID is randomly generated: ' + subject);
    }
}
info_.subject = subject;

// add data to all trials
jsPsych.data.addProperties({
    task: task,
    experiment: experiment,
    info_: info_,
    stimuli_sides: stimuli_sides
});

var timeline = [];

// sample function that might be used to check if a subject has given
// consent to participate.
var check_consent = function (elem) {
    if (document.getElementById('consent_checkbox').checked) {
        return true;
    }
    else {
        alert("If you wish to participate, you must check the box next to the statement 'I agree to participate in this study.'");
        return false;
    }
    return false;
};

// declare the block.
var consent = {
    type: 'external-html',
    url: "../../tasks/delay_discount/consent.html",
    cont_btn: "start",
    check_fn: check_consent
}; timeline.push(consent);

if (fullscreen) {
    timeline.push({
        type: "fullscreen",
        fullscreen_mode: true,
        message: generate_html("The experiment will switch to full screen mode when you press the button below", font_colour)
    });
}

var instructions = {
    type: "instructions",
    pages: [
        generate_html("Welcome!", font_colour, 25, [0, 0]) + generate_html("Click next or press the right arrow key to proceed.", font_colour),
        generate_html("In this task, you'll have to decide which option you prefer.", font_colour) + generate_html("For example, you'll see two options: $30.00 in 3 days or $2.40 in 0 days (today).", font_colour) + generate_html("Choosing $30 days in 3 days means you'll wait 3 days so you can get $30. Choosing $2.40 means you will receive $2.40 today.", font_colour) + generate_html("You'll use the left/right arrow keys on the keyboard to indicate which option you prefer (left or right option, respectively).", font_colour),
        generate_html("Click next or press the right arrow key to begin.", font_colour)
    ],
    show_clickable_nav: true,
    show_page_number: true,
}; timeline.push(instructions);

var trial = {
    type: "html-keyboard-response",
    prompt: generate_html("Press the <b>left</b> or <b>right</b> arrow key to indicate whether <br>you prefer the option on the left or right, respectively.", font_colour, 18, [0, -160]),
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
            var text = generate_html(text_left + text_or + text_right, font_colour, 30);
            if (reverse_sides) { // switch left text to right and vice versa
                text = generate_html(text_right + text_or + text_left, font_colour, 30);
            }
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
        jsPsych.data.get().addToAll({ auc: get_auc(), total_time: jsPsych.totalTime() });
        var subject_id = jsPsych.data.get().filter({ trial_type: "html-keyboard-response" }).select('subject').values[0];
        var indiff_data = jsPsych.data.get().filter({ trial_type: "html-keyboard-response" }).select('indifference').values;
        var cost_data = jsPsych.data.get().filter({ trial_type: "html-keyboard-response" }).select('cost').values;
        var auc_data = jsPsych.data.get().filter({ trial_type: "html-keyboard-response" }).select('auc').values[0];
        var datasummary_ = {
            subject: subject_id,
            trials_per_cost: trials_per_cost,
            indifference: indiff_data,
            cost: cost_data,
            auc: auc_data
        }
        sessionStorage.setObj("delay_discounting_data", datasummary_);
        sessionStorage.setObj("info_", info_);
        jsPsych.data.addProperties({
            datasummary_: datasummary_,
        });
        submit_data(jsPsych.data.get().json(), false);
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