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