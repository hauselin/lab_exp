/**
 * jspsych-survey-text-dropdown
 * a jspsych plugin for dropdown
 *
 * Hause Lin
 *
 * documentation: url
 *
 */

jsPsych.plugins['survey-text-dropdown'] = (function () {

  var plugin = {};

  plugin.info = {
    name: 'survey-text-dropdown',
    description: '',
    parameters: {
      question: {
        type: jsPsych.plugins.parameterType.COMPLEX,
        array: true,
        pretty_name: 'Question',
        default: undefined,
        nested: {
          prompt: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Prompt',
            default: undefined,
            description: 'Prompt for the subject to response'
          },
          options: {
            type: jsPsych.plugins.parameterType.OBJECT,
            pretty_name: 'Options',
            default: undefined,
            description: 'Dropdown menu options'
          },
          name: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Question Name',
            default: '',
            description: 'Controls the name of data values associated with this question'
          }
        }
      },
      preamble: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Preamble',
        default: null,
        description: 'HTML formatted string to display at the top of the page above the question.'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default: 'Continue',
        description: 'The text that appears on the button to finish the trial.'
      },
      required: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Required',
        default: false,
        description: 'Require a response'
      },
    }
  }

  plugin.trial = function (display_element, trial) {

    var html = '';
    // show preamble text
    if (trial.preamble !== null) {
      html += '<div id="jspsych-survey-text-dropdown-preamble" class="jspsych-survey-text-dropdown-preamble">' + trial.preamble + '</div>';
    }
    // start form
    html += '<form id="jspsych-survey-text-dropdown">'

    // see https://www.w3schools.com/tags/tryit.asp?filename=tryhtml5_select_required

    // generate html
    var question = trial.question[0];
    var question_index = 0;
    var question_options = question.options;
    // console.log(question_options)
    html += '<div id="jspsych-survey-text-dropdown-' + question_index + '" class="jspsych-survey-text-dropdown-question" style="margin: 2em 0em;">';
    html += '<p class="jspsych-survey-text-dropdown">' + question.prompt + '</p>';
    var req = trial.required ? "required" : ""; // require response or not
    html += '<select name="' + question.name + '" id="' + question.name + '" ' + req + '>';
    html += '<option value="">None</option>'

    // generate options for dropdown select menu
    question_options.forEach(function (o) {
      temp_html = '<option value="' + o + '">' + o + '</option>';
      // console.log(temp_html)
      html += temp_html;
    })
    html += '</select></div>';

    // add continue/submit button
    html += '<input type="submit" id="jspsych-survey-text-dropdown-next" class="jspsych-btn jspsych-survey-text-dropdown" value="' + trial.button_label + '"></input>';

    html += '</form>'
    display_element.innerHTML = html;
    // console.log(html)
    // console.log(display_element.querySelector('#jspsych-survey-text-dropdown'))

    // listen for response
    display_element.querySelector('#jspsych-survey-text-dropdown').addEventListener('submit', function (e) {
      e.preventDefault();
      // measure response time
      var endTime = performance.now();
      var response_time = endTime - startTime;

      // get selected value
      var q_element = document.querySelector('#jspsych-survey-text-dropdown-0').querySelector('select', 'option');
      // console.log(q_element.value)

      var val = q_element.value;
      if (val == "") {
        val = null;
      }
      var responses = { "prompt": question.prompt, "value": val};
      // save data
      var trialdata = {
        "rt": response_time,
        "responses": JSON.stringify(responses),
        "prompt": question.prompt,
        "value": val
      };

      display_element.innerHTML = '';

      // next trial
      jsPsych.finishTrial(trialdata);
    });

    var startTime = performance.now();
  };

  return plugin;
})();
