// instruction text
let instruct_browser = [
  "To ensure a seamless experience, please use <span style='color:orange; font-weight:bold'>Chrome</span> or <span style='color:orange; font-weight:bold'>Firefox</span> web browser.<br><br>Other browsers like Internet Explorer or Safari aren't supported.",
];

let instruct_intro = [
  "Welcome to our space station.<br><br>Whenever you're ready, press the  <span style='color:orange; font-weight:bold'>right arow key</span> on your keyboard to proceed.",
];

let instruct_mission1 = [
  "You are an adventurous space explorer who will complete several missions in space.<br><br>These missions will require about <span style='color:orange; font-weight:bold'>1.5 hours</span> to complete.<br><br>You will receive <span style='color:orange; font-weight:bold'>$12.50</span> for completing all missions.<br><br>You can also earn a bonus of <span style='color:orange; font-weight:bold'>up to $5</span> (details provided later).",
];

let instruct_mission2 = [
  "You'll have <span style='color:orange; font-weight:bold'>complete them in one setting</span>, so please ensure you feel well-rested and won't be disturbed in the next <span style='color:orange; font-weight:bold'>1.5 hours</span>.<br><br>Most of the time, you will be using the <span style='color:orange; font-weight:bold'>arrow keys</span> on your keyboard to complete the missions.",
];

// DOT-MOTION TASK
let instruct_colortask = [
  "<span style='color:orange; font-weight:bold; font-size:34px;'>New mission: Star Color-Motion Task</span><br><br>For this mission, you'll first learn to identify the <span style='color:orange; font-weight:bold'>color</span> of the moving stars.",
];

let instruct_colortask2 = [
  "You'll see stars in four different colors, moving in different directions.<br><br>Your goal is to ignore the motion/direction of the stars. Instead, focus on identifying the <span style = 'color:orange; font-weight:bold'>predominant color</span>.<br><br>A rocket will also appear before the stars appear. It tells you what you have to do: <span style='color:orange; font-weight:bold'>identify the color of the stars</span>. Try to memorize its appearance.",
];

// color blocks
const instruct_colors = (colours, hex2txt) => {
  let i = 0;
  let html = `If most of the stars are <span style='color:${
    colours[i]
  }; font-weight:bold'>${
    hex2txt[colours[i]]
  }</span>, press the <span style='color:${
    colours[i]
  }; font-weight:bold'>left arrow key</span> on your keyboard.<br>`;

  html += `<span style='color:${colours[i]}; font-weight:bold; font-size: 144%'>
  &lArr; &lArr; &lArr; &lArr;</span><br>`;

  i++;
  html += `If most of the stars are <span style='color:${
    colours[i]
  }; font-weight:bold'>${
    hex2txt[colours[i]]
  }</span>, also press the <span style='color:${
    colours[i]
  }; font-weight:bold'>left arrow key</span>.<br>`;

  html += `<span style='color:${colours[i]}; font-weight:bold; font-size: 144%'>
  &lArr; &lArr; &lArr; &lArr;</span><br><br><br>`;

  i++;
  html += `If most of the stars are <span style='color:${
    colours[i]
  }; font-weight:bold'>${
    hex2txt[colours[i]]
  }</span>, press the <span style='color:${
    colours[i]
  }; font-weight:bold'>right arrow key</span>.<br>`;

  html += `<span style='color:${colours[i]}; font-weight:bold; font-size: 144%'>
  &rArr; &rArr; &rArr; &rArr;</span><br>`;

  i++;
  html += `If most of the stars are <span style='color:${
    colours[i]
  }; font-weight:bold'>${
    hex2txt[colours[i]]
  }</span>, also press the <span style='color:${
    colours[i]
  }; font-weight:bold'>right arrow key</span>.<br>`;

  html += `<span style='color:${colours[i]}; font-weight:bold; font-size: 144%'>
  &rArr; &rArr; &rArr; &rArr;</span><br>`;

  return [html];
};

// color blocks
const colors_remind = (colours, remind_txt) => {
  let i = 0;

  let html = remind_txt + "<br><br>";

  html += `<span style='color:${colours[i]}; font-weight:bold; font-size:233%'>
  &lArr; &lArr; &lArr; &lArr;</span><br><br>`;

  i++;
  html += `<span style='color:${colours[i]}; font-weight:bold; font-size: 233%'>
  &lArr; &lArr; &lArr; &lArr;</span><br><br>`;

  i++;
  html += `<span style='color:${colours[i]}; font-weight:bold; font-size: 233%'>
  &rArr; &rArr; &rArr; &rArr;</span><br><br>`;

  i++;
  html += `<span style='color:${colours[i]}; font-weight:bold; font-size: 233%'>
  &rArr; &rArr; &rArr; &rArr;</span><br><br>`;

  return [html];
};


const instruct_motion1 = ["You're an amazing space explorer and are really good at identifying the color of the moving stars.<br><br>In the next stage, you'll practice identifying the <span style='color:orange; font-weight:bold'>motion/direction</span> the stars, which will be moving mostly <span style='color:orange; font-weight:bold'>left or right</span>.<br><br>Ignore the colors and the few outlier stars that move in other directions."]

const instruct_motion2 = ["A rocket will also appear before the stars appear. This rocket will look different from the one you saw just now.<br><br>It tells you what you have to do: <span style='color:orange; font-weight:bold'>identify the motion of the stars</span>. Again, try to memorize its appearance."]

const instruct_motion3 = ["Next, you'll have the opportunity to practice identifying the motion (left or right) of the majority of the moving stars.<br><br>You'll automatically proceed to the next stage when you're performing well (at least 80% accurate). So try your best to <span style='color:orange; font-weight:bold'>respond as accurately and quickly as possible</span>!<br><br>Remember to ignore the colors of the stars!"]


const instruct_prac_choose_rocket1 = ["Great job so far!<br><br>From now on, you get to choose whether you want to identify the <span style='color:orange; font-weight:bold'>color</span> or <span style='color:orange; font-weight:bold'>motion</span> of the stars.<br><br>You'll see two rockets, indicating the color and motion tasks. You'll <span style='color:orange; font-weight:bold'>choose the one you prefer to do</span>.<br><br>Let's first practice choosing and memorize the appearances of the rockets."]

const instruct_practice_pre_training1 = ["Now let's practice the real mission.<br><br>When you see two rockets, you'll <span style='color:orange; font-weight:bold'>choose the one you prefer</span>. Remember that the two rockets refer to two tasks that require to identify the <span style='color:orange; font-weight:bold'>color</span> or <span style='color:orange; font-weight:bold'>motion</span> of the stars.<br><br>After you've chosen your preferred rocket, you'll <span style='color:orange; font-weight:bold'>perform the chosen task 3 times</span>.<br><br>For example, if you chose the identify-color rocket, you'll identify the color of the majority of the moving stars 3 times while ignoring their motion. If you choose the identify-motion rocket, you'll identify the direction/motion of the majority of the moving stars 3 times while ignoring their colors."]

const instruct_practice_pre_training2 = ["You'll practice choosing rockets and doing the task 10 rounds.<br><br>Since you're just practicing for now, <span style='color:orange; font-weight:bold'>be adventurous by trying to choose different rockets on each round so you fully understand this mission and how good you are at identifying the color or motion of the moving stars</span>.<br>Don't just stick with choosing one rocket.<br><br>You have <span style='color:orange; font-weight:bold'>up to 1.5 seconds</span> to respond; responses slower than that are considered incorrect.<br><br>After each (of 10) rounds, you'll receive feedback on your overall accuracy."]


const instruct_pre_training1 = ["You're ready for the actual space mission.<br><br>You'll choose a rocket (which corresponds to the identify-color or identify-motion task).<br>Then you'll perform the task you have selected."]

const instruct_pre_training2 = ["You have up to 1.5 seconds to perform the task you've chosen.<br><br>You won't receive feedback on the mission.<br><br>Let's begin the actual space mission!"]

const instruct_alien_introduction1 = ["<span style='color:orange; font-weight:bold; font-size:34px;'>New mission: Friendly Alien Task</span><br><br>You just completed another space mission.<br><br>As a result, you've traveled to somewhere in the universe where extraterrestrial life forms and aliens exist."]

const instruct_alien_introduction2 = ["Aliens enjoy the company of space explorers, so they'll provide opportunities to earn points or rewards from them while you're completing missions."]

const instruct_alien_introduction3 = ["If you see a <span style='color:orange; font-weight:bold'>landed spaceship, an alien will be delivering rewards</span> for completing the star color-motion task.<br><br>But if <span style='color:orange; font-weight:bold'>the spaceship hasn't landed, you WON'T be receiving rewards</span>.<br><br>Now you'll take a look at how these two spaceships look like."]

const instruct_alien_rewards1 = ["Remember, when you see a landed spaceship, <span style='color:orange; font-weight:bold'>you can earn points/rewards</span> from the aliens for completing the star color-motion task.<br><br>Importantly, the points you earn will be converted to a <span style='color:orange; font-weight:bold'>cash bonus</span> (up to $5) at the end."]

const instruct_alien_rewards2 = ["How many points you could earn from the aliens depends on some combination of <span style='color:orange; font-weight:bold'>which rocket you choose</span> or/and <span style='color:orange; font-weight:bold'>how well you perform (accuracy and reaction time)</span>.<br><br>If you respond incorrectly or too slowly, you will receive 0 points for that particular response.<br><br>So if the alien gave you very few points, it's likely because you made too many mistakes or/and were slow."]

const instruct_alien_rewards3 = ["<br><br>To maximize your earnings, use the feedback/points you receive from the aliens to improve <span style='color:orange; font-weight:bold'>how well you perform</span> and inform <span style='color:orange; font-weight:bold'>which rocket to choose</span> in the future."]

const instruct_alien_rewards4 = ["Let's practice.<br><br>Since it's just a practice, be adventurous and try choosing different rockets.<br><br>Importantly, observe whether a spaceship has landed initially.<br><br>See how your behavior influences the points you receive from the alien."]


const instruct_training1 = ["Now that you've practiced and familiarized yourself with the aliens and the mission, you're ready to begin the actual mission.<br><br>In the upcoming mission, the <span style='color:orange; font-weight:bold'>spaceship will sometimes land</span> (aliens delivering rewards).<br>But <span style='color:orange; font-weight:bold'>other times it won't land</span> (alien not delivering rewards)."]
const instruct_training2 = ["Always remain vigilant.<br><br>Observe <span style='color:orange; font-weight:bold'>whether the spaceship has landed</span> and <span style='color:orange; font-weight:bold'>the number of points you receive</span>."]
const instruct_training3 = ["<br><br>To maximize your earnings (and cash bonus), constantly use the feedback/points you receive from the aliens to improve <span style='color:orange; font-weight:bold'>how well you perform</span> and inform <span style='color:orange; font-weight:bold'>which rocket to choose</span> in the future.<br><br>Begin the actual mission whenever you're ready."]


const instruct_post_training1 = ["The aliens have retreated so they won't be around to deliver points or rewards."]

const instruct_post_training2 = ["In the next mission, you'll complete the <span style='color:orange; font-weight:bold'>star color-motion task</span> and <span style='color:orange; font-weight:bold'> asteroids task</span> again.<br><br>The tasks will be identical to the ones you completed before the aliens showed up.<br><br>You choose the task you prefer; then you do the task you've chosen.<br><br>Remember, because the aliens have retreated, you will not receive rewards or points from now on."]






const instruct_practice_rocket_choose_post1 = ["Before we begin the <span style='color:orange; font-weight:bold'>star color-motion task</span>, let's quickly review the rockets to make sure you still remember them."]


const instruct_finish1 = ["You're an amazing space explorer! You successfully completed all the space missions.<br><br>Based on the points you've earned from the aliens, you've earned <span style='color:orange; font-weight:bold'>$3.50</span> cash bonus."]







// UPDATE-MATH TASK
const update_instructions1 = [
  "<span style='color:orange; font-weight:bold; font-size:34px;'>New mission: Asteroid Addition Task</span><br><br>For this mission, you'll do arithmetic tasks that involving adding simple addition.<br><br>You'll see sequences of <span style='color:orange; font-weight:bold;'>three numbers</span>. These three numbers will appear one at at time.<span style='color:orange; font-weight:bold;'><br><br>You have to add a digit (0, 3, or 4) to each number</span>, and then indicate the resulting sequence of numbers."
];

const update_instructions2 = ["<br><br>For example, you might see the numbers <span style='color:orange; font-weight:bold;'>0, 7, 8</span>, presented one at a time.<br><br>If you're adding the digit <span style='color:orange; font-weight:bold;'>3</span> to each number in this <span style='color:orange; font-weight:bold;'>078</span> sequence, the resulting sequence is <span style='color:red; font-weight:bold;'>301</span>:<br><br>0 + 3 = <span style='color:red; font-weight:bold;'>3</span><br>7 + 3 = 1<span style='color:red; font-weight:bold;'>0</span><br>8 + 3 = 1<span style='color:red; font-weight:bold;'>1</span>.<br><br>As you can see, if the sum of two numbers is equal to or greater than 10, you ignore the tens digit and report only the ones digit (in <span style='color:red; font-weight:bold;'>red</span>)."]

const update_instructions_34 = ["You'll first practice adding the digit <span style='color:orange; font-weight:bold;'>3</span> or <span style='color:orange; font-weight:bold;'>4</span> to sequences of numbers.<br><br>After adding them, you'll see four potential answers. Only one of them is correct. Use the <span style='color:orange; font-weight:bold;'>up, down, left, or right</span> arrow keys to choose the correct answer.<br><br>An asteroid will also appear before the numbers appear. It tells you what you have to do: <span style='color:orange; font-weight:bold'>add a digit (either 3 or 4)</span> to each number. Try to memorize the asteroid's appearance.<br><br>Note that the same asteroid is used for both adding 3 or 4.<br><br>Let's start practicing."]

const update_instructions_0 = ["You just practiced adding the digit 3 or 4 to sequences of numbers.<br><br>In addition, you'll also get to <span style='color:orange; font-weight:bold;'>add the digit 0</span>, which is equivalent to remembering the sequence of numbers that appear.<br><br>You'll practice adding 0 in a moment."]

const update_instructions_0_1 = ["Again, an asteroid will also appear before the numbers appear. It tells you what you have to do: <span style='color:orange; font-weight:bold'>add the digit 0</span> to each number. Try to memorize the asteroid's appearance.<br><br>Note that the asteroid for adding 0 is different from the one you saw earlier (add 3 or 4).<br><br>Let's start practicing."]

const update_instructions_prac_choose = ["Great job so far! From now on, you get to choose what you prefer to do.<br><br>You can choose to <span style='color:orange; font-weight:bold'>add 0</span><span style='color:orange; font-weight:bold'></span>.<br><br>Or you can choose to <span style='color:orange; font-weight:bold;'>add 3 or 4</span>.<br>If you choose this option, whether it's 3 or 4 will be randomly decided.<br><br>Let's practice and memorize the appearances of the asteroids."]

const update_instructions_prac_pre_training1 = ["Now that you've memorized the asteroiods and understand how to add 0, 3, or 4. Let's practice the actual mission.<br><br>When you see two asteroids, you'll <span style='color:orange; font-weight:bold'>choose the one you prefer</span>. Remember that the two asteroids refer to two different tasks: add 0 versus add 3 or 4.<br><br>After you've chosen your preferred asteroid, you'll <span style='color:orange; font-weight:bold'>add a digit to each number in a sequence of three numbers</span>.<br><br>For example, if you chose the asteroid associated with add 3 or 4, you'll add either 3 or 4 (randomly determined) to each number presented. Then you'll pick the correct answer (out of 4 possible answers)."]

const update_instructions_prac_pre_training2 = ["You'll practice choosing asteroids and doing the addition task for 5 rounds.<br><br>Since you're just practicing for now, <span style='color:orange; font-weight:bold'>be adventurous by trying to choose different asteroids on each round so you fully understand this mission</span>.<br>Don't just stick with choosing one asteroid.<br><br>You have <span style='color:orange; font-weight:bold'>up to 3 seconds</span> to respond."]

const update_instructions_prac_pre_training3 = ["No feedback will be provided after each round. If you respond correctly, incorrectly, or too slowly, you'll proceed to the next round."]

const update_instruc_pretraining1 = ["You're ready for the actual space mission.<br><br>You'll choose an asteroid (which corresponds either to add 0, or add 3 or 4).<br>Then you'll perform the task you have selected."]

const update_instruc_pretraining2 = ["You have up to 3 seconds to perform the task you've chosen.<br><br>You won't receive feedback on the mission.<br><br>Let's begin the actual space mission!"]

const instruct_practice_update_choose_post1 = ["Before we begin the <span style='color:orange; font-weight:bold'>asteroid addition task</span>, let's quickly review the asteroids to make sure you still remember them."]
