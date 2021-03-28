var font_colour = "white";
var background_colour = "black";
set_colour(font_colour, background_colour);

const rocket_files = [
    'stimuli/rocket01.jpg',
    'stimuli/rocket02.jpg',
    'stimuli/rocket03.jpg',
    'stimuli/rocket04.jpg',
    'stimuli/rocket05.jpg',
    'stimuli/rocket06.jpg'
]

var rockets = {
    type: "html-keyboard-response",
    stimulus: `
      <div>
      <div style='float: left; padding-right: 10px'><img src='stimuli/rocket01.jpg' width='100'></img>
      <div style='float: right; padding-left: 10px'><img src='stimuli/rocket02.jpg' width='100'></img>
      </div>
    `,
};

var timeline = []

jsPsych.init({
    timeline: [rockets],
    on_finish: function () {
        jsPsych.data.displayData();
    }
});