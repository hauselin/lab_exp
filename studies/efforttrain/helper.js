function get_training_timeline_variables(
  num_reward_trials,
  num_probe_trials,
  debug = false
) {
  var reward_trial_variable = {
    trial_type: "reward",
    cue_image: "stimuli/alien_reward.png",
    feedback_image: "stimuli/alien_reward_feedback.png",
  };
  var probe_trial_variable = {
    trial_type: "probe",
    cue_image: "stimuli/alien_noreward.png",
    feedback_image: "stimuli/alien_noreward_feedback.png",
  };
  var training_timeline_variables = [reward_trial_variable];

  var num_reward = 1;
  var num_probe = 0;

  for (i = 1; i < num_reward_trials + num_probe_trials; i++) {
    // if the most recently added trial is a probe trial, the next one added must be a reward trial
    if (
      training_timeline_variables[training_timeline_variables.length - 1] ==
      probe_trial_variable
    ) {
      training_timeline_variables.push(reward_trial_variable);
      num_reward++;
    } else {
      // add probe trials based on its theoretical probability
      if (
        num_probe_trials / (num_reward_trials + num_probe_trials) <
        Math.random()
      ) {
        training_timeline_variables.push(probe_trial_variable);
        num_probe++;
      } else {
        training_timeline_variables.push(reward_trial_variable);
        num_reward++;
      }
    }
  }

  if (debug) {
    console.log("Number of initial probes:", num_probe);
    console.log("Number of initial rewards:", num_reward);
    console.log("Number of total trials:", training_timeline_variables.length);
  }

  if (num_probe > num_probe_trials) {
    // if there is a more than expected number of probes
    potential_reward_index = []; // create array of indeces of probe trials that can potentially be reward trials
    for (i = 1; i < training_timeline_variables.length; i++) {
      if (training_timeline_variables[i] == probe_trial_variable) {
        // any probe trial is a potential reward trial
        potential_reward_index.push(i);
      }
    }
    var probes_changed = jsPsych.randomization.sampleWithoutReplacement(
      potential_reward_index,
      num_probe - num_probe_trials
    ); // randomly select trials to change based on the extra number of probe trials
    if (debug) {
      console.log("Indeces of probes changed to rewards:", probes_changed);
    }
    for (i = 0; i < probes_changed.length; i++) {
      // change trials
      training_timeline_variables[probes_changed[i]] = reward_trial_variable;
      num_probe--;
      num_reward++;
    }
  } else if (num_reward > num_reward_trials) {
    potential_probe_index = [];
    for (i = 1; i < training_timeline_variables.length; i++) {
      if (training_timeline_variables[i] == reward_trial_variable) {
        if (potential_probe_index.findIndex((a) => a == i - 1) == -1) {
          // if the previous trial is not a potential probe
          if (training_timeline_variables[i - 1] == reward_trial_variable) {
            // if the previous trial is not a probe
            if (i == training_timeline_variables.length - 1) {
              // the last trial is a potential probe
              potential_probe_index.push(i);
            } else if (
              training_timeline_variables[i + 1] == reward_trial_variable
            ) {
              // a trial is a potential probe if the next trial is also a reward trial
              potential_probe_index.push(i);
            }
          }
        }
      }
    }
    var rewards_changed = jsPsych.randomization.sampleWithoutReplacement(
      potential_probe_index,
      num_reward - num_reward_trials
    );
    if (debug) {
      console.log("Indeces of rewards changed to probes:", rewards_changed);
    }
    for (i = 0; i < rewards_changed.length; i++) {
      training_timeline_variables[rewards_changed[i]] = probe_trial_variable;
      num_probe++;
      num_reward--;
    }
  }

  if (debug) {
    console.log("Number of new probes:", num_probe);
    console.log("Number of new rewards:", num_reward);
    console.log("Number of total trials:", training_timeline_variables.length);

    console.log("Final timeline variables:", training_timeline_variables);
  }

  return training_timeline_variables;
}

// generate up to 1000 (but always fewer) values that can be used as inter-trial-intervals (iti)
// values a sampled from an exponential distribution (default lambda parameter = 4)
function iti_exponential(low = 300, high = 1000, lambda = 4, round_step = 50) {
  let itis = [];
  for (let i = 0; i <= 1000; i++) {
    //
    let iti = (Math.log(1 - Math.random()) / -lambda) * 1000; // multiply by 1000 to convert iti to milliseconds (ms)
    iti += low;
    if (iti <= high) {
      itis.push(round(iti, round_step));
    }
  }
  return itis;
}

// randomly select one value from an array
function random_choice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function range(start, end) {
  var ans = [];
  for (let i = start; i < end; i++) {
    ans.push(i);
  }
  return ans;
}

// round to any step
function round(value, step = 1.0) {
  return Math.round((value * 1.0) / step) / (1.0 / step);
}

function sum(x) {
  var s = 0;
  for (var i = 0; i < x.length; i++) {
    s += x[i];
  }
  return s;
}

function mean(x) {
  return sum(x) / x.length;
}

function array_range(arr) {
  if (arr.length == 0) {
    throw "Array length must be greater than 0!";
  }
  return Math.max(...arr) - Math.min(...arr);
}

// median absolute deviation for values in array x
function mad(x, constant = 1.4826) {
  var med = median(x);
  var output = [];
  x.forEach(function (e) {
    output.push(Math.abs(e - med));
  });
  return median(output) * constant;
}

// compute deviation for each value
function mad_deviation(x, abs = true) {
  var med = median(x);
  var madev = mad(x);
  if (abs) {
    return x.map((i) => Math.abs((i - med) / madev));
  } else {
    return x.map((i) => (i - med) / madev);
  }
}

// return the lower and upper bound for excluding values
function mad_cutoffs(x, cutoff = 3.0) {
  return [median(x) - cutoff * mad(x), median(x) + cutoff * mad(x)];
  // values < element 0 or values > element 1 are considered outliers
}

// generate random normal numbers with mean 0 and SD 1
// https://filosophy.org/code/normal-distributed-random-values-in-javascript-using-the-ziggurat-algorithm/
function Ziggurat() {
  var jsr = 123456789;

  var wn = Array(128);
  var fn = Array(128);
  var kn = Array(128);

  function RNOR() {
    var hz = SHR3();
    var iz = hz & 127;
    return Math.abs(hz) < kn[iz] ? hz * wn[iz] : nfix(hz, iz);
  }

  this.nextGaussian = function () {
    return RNOR();
  };

  function nfix(hz, iz) {
    var r = 3.442619855899;
    var r1 = 1.0 / r;
    var x;
    var y;
    while (true) {
      x = hz * wn[iz];
      if (iz == 0) {
        x = -Math.log(UNI()) * r1;
        y = -Math.log(UNI());
        while (y + y < x * x) {
          x = -Math.log(UNI()) * r1;
          y = -Math.log(UNI());
        }
        return hz > 0 ? r + x : -r - x;
      }

      if (fn[iz] + UNI() * (fn[iz - 1] - fn[iz]) < Math.exp(-0.5 * x * x)) {
        return x;
      }
      hz = SHR3();
      iz = hz & 127;

      if (Math.abs(hz) < kn[iz]) {
        return hz * wn[iz];
      }
    }
  }

  function SHR3() {
    var jz = jsr;
    var jzr = jsr;
    jzr ^= jzr << 13;
    jzr ^= jzr >>> 17;
    jzr ^= jzr << 5;
    jsr = jzr;
    return (jz + jzr) | 0;
  }

  function UNI() {
    return 0.5 * (1 + SHR3() / -Math.pow(2, 31));
  }

  function zigset() {
    // seed generator based on current time
    jsr ^= new Date().getTime();

    var m1 = 2147483648.0;
    var dn = 3.442619855899;
    var tn = dn;
    var vn = 9.91256303526217e-3;

    var q = vn / Math.exp(-0.5 * dn * dn);
    kn[0] = Math.floor((dn / q) * m1);
    kn[1] = 0;

    wn[0] = q / m1;
    wn[127] = dn / m1;

    fn[0] = 1.0;
    fn[127] = Math.exp(-0.5 * dn * dn);

    for (var i = 126; i >= 1; i--) {
      dn = Math.sqrt(-2.0 * Math.log(vn / dn + Math.exp(-0.5 * dn * dn)));
      kn[i + 1] = Math.floor((dn / tn) * m1);
      tn = dn;
      fn[i] = Math.exp(-0.5 * dn * dn);
      wn[i] = dn / m1;
    }
  }
  zigset();
}

function determine_reward(x, b = -0.1) {
  return x.map((i) => 1 / (1 + Math.exp(-i * b)));
}

function calculate_points_obj(
  rt,
  rew_min = 230,
  rew_max = 370,
  func = determine_reward
) {
  if (rt.length == 0) {
    // in case there aren't RTs in array
    rt = [300, 500, 700];
  } else if (array_range(rt) == 0) {
    // in case there is not enough range
    rt.push(rt[0] / 2);
    rt.push(rt[0] + rt[0] / 2);
  }
  // trim RTs
  var rtcutoffs = mad_cutoffs(rt, 3.0);
  rt = rt.filter((i) => i > rtcutoffs[0] && i < rtcutoffs[1]);

  // generate sequence of RTs from min to max value
  let rt_min = Math.floor(Math.min(...rt));
  let rt_max = Math.floor(Math.max(...rt));
  let rt_range = rt_max - rt_min;
  rt = range(rt_min, rt_max); // range function excludes last value
  rt.push(Math.max(...rt) + 1); // add last value

  // median-center RT values
  rtC = rt.map((i) => i - median(rt)); // vectorize

  // calculate beta (which depends on RT range)
  // TODO: 25 can be changed, but looks good
  let beta = (-1 / rt_range) * 25;

  // points for each RT
  var points = func(rtC, beta);
  points[0] = Math.ceil(points[0]);
  points[points.length - 1] = Math.floor(points[points.length - 1]);
  var rew_range = rew_max - rew_min;
  var points = points.map((i) => i * rew_range + rew_min);

  // create object maps rt to points {300: 370, 301: 369}...
  let obj = {};
  for (i = 0; i < rt.length; i++) {
    obj[rt[i]] = points[i];
  }

  return obj;
}

function calculate_points(rt, points_obj) {
  if (points_obj[Math.round(rt)] != undefined) {
    return points_obj[Math.round(rt)];
  } else {
    if (Math.round(rt) < Object.keys(points_obj)[0]) {
      return Object.values(points_obj)[0];
    } else if (
      Math.round(rt) >
      Object.keys(points_obj)[Object.keys(points_obj).length - 1]
    ) {
      return Object.values(points_obj)[Object.keys(points_obj).length - 1];
    }
  }
}
