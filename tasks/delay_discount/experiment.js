var timeline = [];

var trial_number = 0;
const delayed_reward = 100;
var reward = delayed_reward / 2;
var delay = 10;

var trial = {
  type: 'html-keyboard-response',
  // prompt: "<p>Press the left or right arrow key indicating whether you prefer the option on the left or right, respectively.</p>",
  prompt: '<div style="transform: translateY(-130px); font-size: 15px;"> Press the <b>left</b> or <b>right</b> arrow key to indicate whether <br>you prefer the option on the left or right, respectively. </div>',
  stimulus: function () {
    return "$" + delayed_reward.toFixed(2) + " in " + delay + " days &nbsp;&nbsp; or &nbsp;&nbsp;  $" + reward.toFixed(2) + " in 0 days"
  },
  choices: [37, 39],
  post_trial_gap: 750,
  on_finish: function (data) {
    if (data.key_press == 37) {
      reward = (100 + reward) / 2
    }
    else if (data.key_press == 39) {
      reward = (0 + reward) / 2
    }
    if (trial_number <= 5) {
      trial_number += 1;
    }
    else if (trial_number > 5) {
      trial_number = 0;
      reward = delayed_reward / 2;
      delay = Math.floor(delay / 2);  // hm? delay shouldn't change?
    }
  }
};
timeline.push(trial);

var loop_node = {
  timeline: [trial],
  loop_function: function (data) {
    if (delay >= 1) {
      return true;
    }
    else if (delay < 1) {
      return false;
    }
  }
};

jsPsych.init({
  timeline: [loop_node],
  on_finish: function () {
    jsPsych.data.displayData();
  }
});