function get_training_timeline_variables(num_reward_trials, num_probe_trials, debug=false) {
    var reward_trial_variable = { trial_type: 'reward' };
    var probe_trial_variable = { trial_type: 'probe' };
    var training_timeline_variables = [reward_trial_variable];

    var num_reward = 1;
    var num_probe = 0;

    for (i = 1; i < (num_reward_trials + num_probe_trials); i++) {
        if (training_timeline_variables[training_timeline_variables.length - 1] == probe_trial_variable) {
            training_timeline_variables.push(reward_trial_variable);
            num_reward++;
        } else {
            if (num_probe_trials / (num_reward_trials + num_probe_trials) < Math.random()) {
                training_timeline_variables.push(probe_trial_variable);
                num_probe++;
            } else {
                training_timeline_variables.push(reward_trial_variable);
                num_reward++;
            }
        }
    }

    if (debug) {
        console.log('Number of initial probes:', num_probe);
        console.log('Number of initial rewards:', num_reward);
        console.log('Number of total trials:', training_timeline_variables.length);
    }

    if (num_probe > num_probe_trials) {
        potential_reward_index = []
        for (i = 1; i < training_timeline_variables.length; i++) {
            if (training_timeline_variables[i] == probe_trial_variable) {
                potential_reward_index.push(i);
            }
        }
        var probes_changed = jsPsych.randomization.sampleWithoutReplacement(potential_reward_index, (num_probe - num_probe_trials))
        if (debug) {
            console.log('Indeces of probes changed to rewards:', probes_changed);
        }
        for (i = 0; i < probes_changed.length; i++) {
            training_timeline_variables[probes_changed[i]] = reward_trial_variable
            num_probe--;
            num_reward++;
        }
    } else if (num_reward > num_reward_trials) {
        potential_probe_index = []
        for (i = 1; i < training_timeline_variables.length; i++) {
            if (training_timeline_variables[i] == reward_trial_variable) {
                if (potential_probe_index.findIndex(a => a == (i - 1)) == -1) {
                    if (training_timeline_variables[i - 1] == reward_trial_variable) {
                        if (i == training_timeline_variables.length - 1) {
                            potential_probe_index.push(i);
                        } else if (training_timeline_variables[i + 1] == reward_trial_variable) {
                            potential_probe_index.push(i);
                        }
                    }
                }
            }
        }
        var rewards_changed = jsPsych.randomization.sampleWithoutReplacement(potential_probe_index, (num_reward - num_reward_trials))
        if (debug) {
            console.log('Indeces of rewards changed to probes:', rewards_changed);
        }
        for (i = 0; i < rewards_changed.length; i++) {
            training_timeline_variables[rewards_changed[i]] = probe_trial_variable
            num_probe++;
            num_reward--;
        }
    }

    if (debug) {
        console.log('Number of new probes:', num_probe);
        console.log('Number of new rewards:', num_reward);
        console.log('Number of total trials:', training_timeline_variables.length);
    
        console.log('Final timeline variables:', training_timeline_variables)    
    }

    return training_timeline_variables
}

