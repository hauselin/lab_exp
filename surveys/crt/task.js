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
