/**
 * utils.js
 **/

function range(start, end) {
  let ans = [];
  for (let i = start; i <= end; i++) {
    ans.push(i);
  }
  return ans;
}

// https://stackoverflow.com/questions/6137986/javascript-roundoff-number-to-nearest-0-5
// round to any step
function round(value, step = 1.0) {
  return Math.round(value * 1.0 / step) / (1.0 / step);
}

// generate up to 1000 (but always fewer) values that can be used as inter-trial-intervals (iti)
// values a sampled from an exponential distribution (default lambda parameter = 4)
function iti_exponential(low = 300, high = 1000, lambda = 4, round_step = 50) {
  let itis = [];
  for (let i = 0; i <= 1000; i++) { // 
    let iti = Math.log(1 - Math.random()) / (-lambda) * 1000 // multiply by 1000 to convert iti to milliseconds (ms)
    if (iti >= low && iti <= high) {
      itis.push(round(iti, round_step));
    }
  }
  return itis;
}

// randomly select one value from an array
function random_choice(array) {
  return array[Math.floor(Math.random() * array.length)];
}