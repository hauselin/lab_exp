var instructions = {
    type: "html-keyboard-response",
    stimulus: `
      <div>
      <div style='float: left; padding-right: 10px'><img src='stimuli/rocket01.jpg' width='100'></img>
      <div style='float: right; padding-left: 10px'><img src='stimuli/rocket02.jpg' width='100'></img>
      </div>
    `,
};

jsPsych.init({
    timeline: [instructions],
    on_finish: function () {
        jsPsych.data.displayData();
    }
});