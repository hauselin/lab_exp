var timeline = [];

const delayed_reward = 100; //Large reward after delay.
const quantile_range = [0.40, 0.60] //Quantiles within window to draw values from.
const trial_per_delay = 5; //Number of trials per delay.

var reward = null;  //Small reward without delay.
var delay = [2, 10, 15, 20, 50];  //Delay in days.
var delay_index = 0;
var trial_number = 1;
var reward_window = [0, delayed_reward];

var trial = {
  on_start: function(trial){
    var lower = (reward_window[1] - reward_window[0]) * quantile_range[0] + reward_window[0];
    var upper = (reward_window[1] - reward_window[0]) * quantile_range[1] + reward_window[0];
    reward = math.random(lower, upper);
    trial.stimulus = "$" + delayed_reward.toFixed(2) + " in " + delay[delay_index] + " days &nbsp;&nbsp; or &nbsp;&nbsp;  $" + reward.toFixed(2) + " in 0 days";
  },
  type: 'html-keyboard-response',
  // prompt: "<p>Press the left or right arrow key indicating whether you prefer the option on the left or right, respectively.</p>",
  prompt: '<div style="transform: translateY(-130px); font-size: 15px;"> Press the <b>left</b> or <b>right</b> arrow key to indicate whether <br>you prefer the option on the left or right, respectively. </div>',
  choices: [37, 39],
  post_trial_gap: 750,
  on_finish: function (data) {
    if (data.key_press == 37) {
      reward_window[0] = reward;
    }
    else if (data.key_press == 39) {
      reward_window[1] = reward;
    }
    if (trial_number < trial_per_delay) {
      trial_number += 1;
    }
    else if (trial_number >= trial_per_delay) {
      trial_number = 0;
      reward = math.random(delayed_reward * quantile_range[0], delayed_reward * quantile_range[1]);
      reward_window = [0, delayed_reward];
      delay_index += 1;
    }
  }
};
timeline.push(trial);

var loop_node = {
  timeline: [trial],
  loop_function: function (data) {
    if (delay_index < delay.length) {
      if (delay_index == delay.length - 1 && trial_number == trial_per_delay){
        return false;
      }
      return true;
    }
  }
};

jsPsych.init({
  timeline: [loop_node],
  on_finish: function () {
    jsPsych.data.displayData();
  }
});