var grit_survey = {
    type: 'external-html',
    url: "../surveys/grit_short.html"
}

jsPsych.init({
    timeline: [grit_survey]
})