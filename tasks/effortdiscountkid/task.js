
// const taskinfo = {
//     type: 'task', // 'task', 'survey', or 'study'
//     uniquestudyid: 'effortdiscountkid', // unique task id: must be IDENTICAL to directory name
//     desc: 'effort discounting task for kids', // brief description of task
//     condition: null, // experiment/task condition
//     redirect_url: false //"/tasks/effortdiscountkid/viz" // set to false if no redirection required
// };

// var info_ = create_info_(taskinfo);

// const debug = false;  // debug mode to print messages to console and display json data at the end
const black_background = false; // if true, white text on black background
var font_colour = 'black';
if (black_background) {
    document.body.style.backgroundColor = "black";
    var font_colour = 'white';
}

// TASK PARAMETERS
var stars = 25;
var dim = 5;
// const large_reward = gridCreator(stars, dim); //Large reward after cost.
var costs = [1, 2, 3, 4, 5];  //costs in aliens.
// var costs = [2, 5]; // I tend to use fewer when debugging (so the task finishes faster)
const trials_per_cost = 6; //Number of trials per cost/delays.
const practice_trials = 3; //Number of practice trials.

// parameters below typically don't need to be changed
var small_reward = null;  //Small reward without cost.
const quantile_range = [0.40, 0.60] //Quantiles within window to draw values from.
costs = jsPsych.randomization.shuffle(costs);

var n_cost = 0;
var n_trial = 0;
var n_trial_overall = 0;
// var reward_window = [0, large_reward];

// var reverse_sides = Math.random() > 0.5; // randomly determine whether to switch large/small reward sides
// var stimuli_sides = "left_large_right_small";
// if (reverse_sides) {
//     stimuli_sides = "left_small_right_large";
// }

// // add subject id and task info to all trials
// jsPsych.data.addProperties({
//     subject: info_.subject,
//     type: taskinfo.type,
//     uniquestudyid: taskinfo.uniquestudyid,
//     desc: taskinfo.desc,
//     condition: taskinfo.condition,    
// });

// create experiment timeline
var timeline = [];
// const html_path = "../../tasks/delaydiscount/consent.html";
// timeline = create_consent(timeline, html_path);

var instructions = {
    type: "instructions",

    pages: [
        generate_html("Welcome!", font_colour, 25, [0, 0]) + generate_html("Press the right arrow key.", font_colour),
        generate_html("In this task, you'll have to decide which option you prefer.", font_colour) + generate_html("For example, you'll see two options:", font_colour) +  "<br><br>" + gridCreator(25, 1, 12, 0, 5, "&#11088", "&#x1F479"),
        generate_html("If you want 25 stars, you must catch 1 alien. If you want 12 stars, you must catch 0 aliens.", font_colour) + generate_html("Use the left/right arrow keys on the keyboard to choose.", font_colour),
        generate_html("Next up is a practice trial.", font_colour) + generate_html("Your data will NOT be recorded.", font_colour) + generate_html("Click next or press the right arrow key to begin.", font_colour)
    ],
    show_clickable_nav: true,
    show_page_number: true,
};

timeline.push(instructions);

jsPsych.init({
    timeline: timeline
})

function add_aliens(alien_count, alien_em) {
    var al_count = 1;
        str = "";
    while (al_count <= alien_count) {
        str += "<span style=font-size:3rem>" + alien_em + "</span>";
        al_count += 1;
    } return str;
}

function add_stars(star_count, star_em, dim) {
    var dim_r = dim;
        curr_1 = 1;
        str = "";
    while (curr_1 <= star_count) {
        if (curr_1 <= dim_r) {
            str += "<span style=font-size:3rem>" + star_em + "</span>";
            curr_1 += 1;            
        } else {
            str += "<br> <br>";
            dim_r += 5;
        }
    } return str ;
}

function gridCreator(op_1_s, op_1_a, op_2_s, op_2_a, dim, s_em, a_em) {
    var str_s_1 = add_stars(op_1_s, s_em, dim);
        str_a_1 = add_aliens(op_1_a, a_em);
        str_s_2 = add_stars(op_2_s, s_em, dim);
        str_a_2 = add_aliens(op_2_a, a_em);
    
    return "<div class='container'>" + 
                "<div class='row'>" +
                    "<div class='col' style=column-gap:80px;>" +

                        "<div class='column' style=float:left;margin-right:150px;text-align:left;>"
                            + str_s_1 + "<br><br>" + str_a_1 +
                        "</div>" + 
                        "<div class='column' style=float:left;margin-left:150px;text-align:left;>"
                            + str_s_2 + "<br><br>" + str_a_2 + "<br><br><br><br><br><br>" +
                        "</div>" +

                    "</div>" +
                "</div>" +
            "</div>"
}