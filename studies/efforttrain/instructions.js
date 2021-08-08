// instruction text
let instruct_browser = [
  "To ensure a seamless experience, please use Chrome or Firefox web browser.<br><br>Other browsers like Internet Explorer or Safari aren't supported.",
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
  "You'll see stars in four different colors, moving in different directions.<br><br>Focus on identifying the <span style='color:orange; font-weight:bold'>predominant color</span>. Which color appears most frequently?<br><br>You'll also see a rocket before seeing the colored stars. Whenever you see that particular rocket, it means you have to identify the <span style='color:orange; font-weight:bold'>color</span> of the stars.<br><br>Memorize that particular rocket's appearance.",
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
