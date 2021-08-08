// instruction text
let instruct_browser = [
  "To ensure a seamless experience, please use <span style='color:orange; font-weight:bold'>Chrome</span> or <span style='color:orange; font-weight:bold'>Firefox</span> web browser.<br><br>Other browsers like Internet Explorer or Safari aren't supported.",
];

let instruct_intro = [
  "Welcome to our space station.<br><br>Whenever you're ready, click next or press the right arow key on your keyboard to proceed.",
];

let instruct_mission1 = [
  "You are an adventurous space explorer who will complete several missions in space.<br><br>These missions will require about <span style='color:orange; font-weight:bold'>1.5 hours</span> to complete.<br><br>You will receive <span style='color:orange; font-weight:bold'>$12.50</span> for completing all missions.<br><br>You can also earn a bonus of <span style='color:orange; font-weight:bold'>up to $5</span> (details provided later).",
];

let instruct_mission2 = [
  "You'll have <span style='color:orange; font-weight:bold'>complete them in one setting</span>, so please ensure you feel well-rested and won't be disturbed in the next <span style='color:orange; font-weight:bold'>1.5 hours</span>.<br><br>Most of the time, you will be using the <span style='color:orange; font-weight:bold'>arrow keys</span> on your keyboard to complete the missions.",
];

let instruct_colortask = [
  "One mission is the <span style='color:orange; font-weight:bold'>star color-motion task</span>.<br><br>First, let's learn to identify the <span style='color:orange; font-weight:bold'>color</span> of the moving stars.",
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
