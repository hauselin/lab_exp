const taskinfo = {
    type: 'task', // 'task', 'survey', or 'study'
    uniquestudyid: 'effortdiscountkid', // unique task id: must be IDENTICAL to directory name
    desc: 'effort discounting task for kids', // brief description of task
    condition: null, // experiment/task condition
    redirect_url: false //"/tasks/effortdiscountkid/viz" // set to false if no redirection required
};

var info_ = create_info_(taskinfo);

const debug = false;  // debug mode to print messages to console and display json data at the end
const black_background = true; // if true, white text on black background
var font_colour = 'black';
if (black_background) {
    document.body.style.backgroundColor = "black";
    var font_colour = 'white';
}

var stars = 25;
var dim = 5;
const large_reward = gridCreator(stars, dim); //Large reward after cost.
var costs = [1, 2, 3, 4, 5];  //costs in aliens.
// var costs = [2, 5]; // I tend to use fewer when debugging (so the task finishes faster)
const trials_per_cost = 6; //Number of trials per cost/delays.
const practice_trials = 3; //Number of practice trials.



function gridCreator(stars, dim) {
    var curr = 1;
        str = "";

    while (curr <= stars) {
        if (curr <= dim) {
            str += "S";
            curr += 1;
        }
        else {
            str += "\n";
            row += 5;
        }
    }

    return str;

}