var trial = {
    type: 'html-slider-response', 
    stimulus: "<p>New ideas and projects sometimes distract me from previous ones.</p>", 
    labels: ['Very much like me', 'Mostly like me', 'Somewhat like me', 
        'Not much like me', 'Not like me at all'],
    require_movement: true
};

jsPsych.init({
    timeline: [trial],
    on_finish: function() {
        jsPsych.data.displayData();
    }
})
