/**
 *
 * jspsych-visual-search-circle
 * Josh de Leeuw
 *
 * display a set of objects, with or without a target, equidistant from fixation
 * subject responds to whether or not the target is present
 *
 * based on code written for psychtoolbox by Ben Motz
 *
 * documentation: docs.jspsych.org
 *
 * Edits (made by Josh Eayrs, 06/07/2021):
 * - Added peripheral flanker stimuli
 * - Added timeout and blank response screen
 * - Changed response options from present versus absent to target 1 versus 2
 **/

jsPsych.plugins["visual-search-circle"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('visual-search-circle', 'target', 'image');
  jsPsych.pluginAPI.registerPreload('visual-search-circle', 'foil', 'image');
  jsPsych.pluginAPI.registerPreload('visual-search-circle', 'fixation_image', 'image');

  plugin.info = {
    name: 'visual-search-circle',
    description: '',
    parameters: {
      target: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Target',
        default: undefined,
        description: 'The image to be displayed.'
      },
      foil: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Foil',
        default: undefined,
        description: 'Path to image file that is the foil/distractor.'
      },
      fixation_image: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Fixation image',
        default: undefined,
        description: 'Path to image file that is a fixation target.'
      },
      set_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Set size',
        default: undefined,
        description: 'How many items should be displayed?'
      },
      target_present: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Target present',
        default: true,
        description: 'Is the target present?'
      },
      target_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Target size',
        array: true,
        default: [50, 50],
        description: 'Two element array indicating the height and width of the search array element images.'
      },
      fixation_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Fixation size',
        array: true,
        default: [16, 16],
        description: 'Two element array indicating the height and width of the fixation image.'
      },
      circle_diameter: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Circle diameter',
        default: 250,
        description: 'The diameter of the search array circle in pixels.'
      },
      // changed from 'present & absent' to 'target 1 & target 2'
      // changed default key responses to N & Z
      target_1_key: {
        type: jsPsych.plugins.parameterType.KEY,
        pretty_name: 'Target 1 key',
        default: 'n',
        description: 'The key to press if target 1 is present in the search array.'
      },
      target_2_key: {
        type: jsPsych.plugins.parameterType.KEY,
        pretty_name: 'Target 2 key',
        default: 'z',
        description: 'The key to press if target 1 is present in the search array.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'The maximum duration to wait for a response.'
      },
      fixation_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Fixation duration',
        default: 1000,
        description: 'How long to show the fixation image for before the search array (in milliseconds).'
      },
      // added entry for flanker image
      flanker_image: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Flanker image',
        default: undefined,
        description: 'Path to image file for the flanker stimuli.'
      },
      // added entry for stimulus duration
      search_array_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: 200,
        description: 'How long to show the search stimuli before blank (response) screen (in ms).'
      },
      // added entry for flanker offset distance
      flanker_offset: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Flanker offset',
        default: 1.5,
        description: 'How many multiples of the circle radius to offset the flankers (horizontally from the screen center).'
      },
      // added entry for flanker size
      flanker_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Flanker size',
        default: 1.5,
        description: 'Size of the flanker stimuli relative to target_size (multiplier).'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    // circle params
    var diam = trial.circle_diameter; // pixels
    var radi = diam / 2;
    //var paper_size = diam + trial.target_size[0];

    // stimuli width, height
    var stimh = trial.target_size[0];
    var stimw = trial.target_size[1];
    var hstimh = stimh / 2;
    var hstimw = stimw / 2;

    // added stimulus dimensions for flankers
    var flankerh = stimh *trial.flanker_size;
    var flankerw = stimw *trial.flanker_size;
    var hflankerh = flankerh/2;
    var hflankerw = flankerw/2;
    var flanker_offset = hflankerw + (radi * trial.flanker_offset);
    // paper_size moved here to accommodate flankers
    var paper_size = diam + flanker_offset;

    // fixation location
    var fix_loc = [Math.floor(paper_size / 2 - trial.fixation_size[0] / 2), Math.floor(paper_size / 2 - trial.fixation_size[1] / 2)];

    // possible stimulus locations on the circle
    var display_locs = [];
    var possible_display_locs = trial.set_size;
    var random_offset = Math.floor(Math.random() * 360);
    for (var i = 0; i < possible_display_locs; i++) {
      display_locs.push([
        Math.floor(paper_size / 2 + (cosd(random_offset + (i * (360 / possible_display_locs))) * radi) - hstimw),
        Math.floor(paper_size / 2 - (sind(random_offset + (i * (360 / possible_display_locs))) * radi) - hstimh)
      ]);
    }

    // added flanker positions based on flanker offset defined above
    var flanker_locs = [[Math.floor(paper_size/2) - hflankerw, Math.floor(paper_size/2 + (flanker_offset - hflankerw))],
                        [Math.floor(paper_size/2) - hflankerw, Math.floor(paper_size/2 - (flanker_offset + hflankerw))]];

    // get target to draw on
    display_element.innerHTML += '<div id="jspsych-visual-search-circle-container" style="position: relative; width:' + paper_size + 'px; height:' + paper_size + 'px"></div>';
    var paper = display_element.querySelector("#jspsych-visual-search-circle-container");

    // check distractors - array?
    if(!Array.isArray(trial.foil)){
      fa = [];
      for(var i=0; i<trial.set_size; i++){
        fa.push(trial.foil);
      }
      trial.foil = fa;
    }

    show_fixation();

    function show_fixation() {
      // show fixation
      //var fixation = paper.image(trial.fixation_image, fix_loc[0], fix_loc[1], trial.fixation_size[0], trial.fixation_size[1]);
      paper.innerHTML += "<img src='"+trial.fixation_image+"' style='position: absolute; top:"+fix_loc[0]+"px; left:"+fix_loc[1]+"px; width:"+trial.fixation_size[0]+"px; height:"+trial.fixation_size[1]+"px;'></img>";

      // wait
      jsPsych.pluginAPI.setTimeout(function() {
        // after wait is over
        show_search_array();
      }, trial.fixation_duration);
    }

    function show_search_array() {

      var search_array_images = [];

      var to_present = [];
      if(trial.target_present){
        to_present.push(trial.target);
      }
      to_present = to_present.concat(trial.foil);

      for (var i = 0; i < display_locs.length; i++) {

        paper.innerHTML += "<img src='"+to_present[i]+"' style='position: absolute; top:"+display_locs[i][0]+"px; left:"+display_locs[i][1]+"px; width:"+trial.target_size[0]+"px; height:"+trial.target_size[1]+"px;'></img>";

      }

      // added the two flanker stimuli, image id determined by 'flanker_image'
      // locations determined above
      paper.innerHTML += "<img src='"+trial.flanker_image+"' style='position: absolute; top:"+flanker_locs[0][0]+"px; left:"+flanker_locs[0][1]+"px; width:"+flankerw+"px; height:"+flankerh+"px;'></img>";
      paper.innerHTML += "<img src='"+trial.flanker_image+"' style='position: absolute; top:"+flanker_locs[1][0]+"px; left:"+flanker_locs[1][1]+"px; width:"+flankerw+"px; height:"+flankerh+"px;'></img>";

      // wait for the 'search_array_duration' and then clear the screen and wait
      // for a response
      // NOTE: Here, I've done this by just splitting the 'show_search_array'
      // function into two, this means responses faster than 'search_array_duration'
      // won't be recorded - which is fine if that duration is going to be 100ms
      // or 200ms, but would be problematic for longer displays. Also need to
      // remember that this probably means I'll have to add 'search_array_duration'
      // to the eventual recorded RT. An alternative would be to wait 'search_array_duration'
      // and clear the screen within the same function
      jsPsych.pluginAPI.setTimeout(function() {
        // after wait is over
        show_response_screen();
      }, trial.search_array_duration);
    }

      function show_response_screen() {

      // moved from below to clear the screen while waiting for a response
      clear_display();

      var trial_over = false;

      var after_response = function(info) {

        trial_over = true;

        var correct = false;

        if ((jsPsych.pluginAPI.compareKeys(info.key, trial.target_1_key)) &&
          trial.target == 'img/target1.png' ||
            (jsPsych.pluginAPI.compareKeys(info.key, trial.target_2_key)) &&
             !trial.target == 'img/target2.png') {
          correct = true;
        }

        end_trial(info.rt, correct, info.key);

      }

      var valid_keys = [trial.target_1_key, trial.target_2_key];

      key_listener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: valid_keys,
        rt_method: 'performance',
        persist: false,
        allow_held_key: false
      });

      if (trial.trial_duration !== null) {

        jsPsych.pluginAPI.setTimeout(function() {

          if (!trial_over) {

            jsPsych.pluginAPI.cancelKeyboardResponse(key_listener);

            trial_over = true;

            var rt = null;
            var correct = 0;
            var key_press = null;

            clear_display();

            end_trial(rt, correct, key_press);
          }
        }, trial.trial_duration);

      }

      function clear_display() {
        display_element.innerHTML = '';
      }
    }


    function end_trial(rt, correct, key_press) {

      // data saving
      var trial_data = {
        correct: correct,
        rt: rt + trial.search_array_duration,//responses not recorded during stim display
        response: key_press,
        locations: display_locs,
        target_image: trial.target,
        set_size: trial.set_size,
        flanker_image: trial.flanker_image
      };

      // go to next trial
      jsPsych.finishTrial(trial_data);
    }
  };

  // helper function for determining stimulus locations

  function cosd(num) {
    return Math.cos(num / 180 * Math.PI);
  }

  function sind(num) {
    return Math.sin(num / 180 * Math.PI);
  }

  return plugin;
})();
