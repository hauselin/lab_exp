// DEFINE TASK (required)
const taskinfo = {
    type: 'survey', // 'task', 'survey', or 'study'
    uniquestudyid: 'crt', // unique task id: must be IDENTICAL to directory name
    desc: 'cognitive reflection', // brief description of task
    condition: null, // experiment/task condition
    redirect_url: "/surveys/crt/viz" // set to false if no redirection required
};
var info_ = create_info_(taskinfo);  // initialize subject id and task parameters
const debug = false;  // true to print messages to console and display json results
var font_colour = "black";
var background_colour = "white";
set_colour(font_colour, background_colour);

// DEFINE TASK PARAMETERS (required)
acc_vals = [-1, 0, 1]

jsPsych.data.addProperties({ // do not edit this section unnecessarily!
    subject: info_.subject,
    type: taskinfo.type,
    uniquestudyid: taskinfo.uniquestudyid,
    desc: taskinfo.desc,
    condition: taskinfo.condition,
});

// create experiment objects and timeline
var instructions = {
    type: "instructions",
    pages: [
        generate_html("Welcome!", font_colour, 25, [0, 0]) + generate_html("You're going to read several brain teasers. Try to answer them!", font_colour),
    ],
    show_clickable_nav: true,
    show_page_number: false,
};