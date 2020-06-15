var grit_procedure = {
    timeline: [
        {
            type: 'html-slider-response', 
            stimulus: jsPsych.timelineVariable('remark'), 
            labels: ['Very much like me', 'Mostly like me', 'Somewhat like me', 
                'Not much like me', 'Not like me at all'],
            require_movement: true, 
            slider_width: 900
        }
    ], 
    timeline_variables: [
        {remark: '<p>I often set a goal but later choose to pursue a different one.</p>'},
        {remark: '<p>New ideas and projects sometimes distract me from previous ones.</p>'}, 
        {remark: '<p>I have been obsessed with a certain idea or project for a short time but later lost interest.</p>'},
        {remark: '<p>I have difficulty maintaining my focus on projects that take more than a few months to complete.</p>'},
        {remark: '<p>I finish whatever I begin.</p>'},
        {remark: "<p>Setbacks don't discourage me.</p>"},
        {remark: '<p>I am diligent.</p>'}, 
        {remark: '<p>I am a hard worker.</p>'},
        {remark: '<p>New ideas and projects sometimes distract me from previous ones.</p>'}
        
    ]
};



jsPsych.init({
    timeline: [grit_procedure],
    on_finish: function() {
        jsPsych.data.displayData();
    }
})
