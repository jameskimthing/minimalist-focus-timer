const settingsFormInputsSettings = {
  workSessionLength: {
    name: "Work Session Length",
    min: 1,
    max: 120,
    type: "mins",
  },
  breakSessionLength: {
    name: "Break Session Length",
    min: 1,
    max: 60,
    type: "mins",
  },
  longBreakSessionLength: {
    name: "Long Break Session Length",
    min: 1,
    max: 60,
    type: "mins",
  },
  sessionRounds: {
    name: "Session Rounds",
    min: 1,
    max: 10,
    type: "rounds",
  },
};

/**
 * Supposed to be used in `main.js` after getting the stored settings
 *
 * ```
 * <div class="settings-slider-wrapper">
 *   <div class="settings-slider-info-wrapper">
 *     <span name="inputInfoName">Work Session Length</span>
 *     <span name="inputInfoValue">25</span>
 *   </div>
 *   <!-- type is either "mins" or "rounds" -->
 *   <input class="settings-slider" type="range" name="workSessionLength" min="1" max="120" step="1" value="25">
 * </div>
 * ```
 */
function initializeSettingsPage() {
  const settingsPage = document.getElementById("settingsPage");
  const settingsForm = document.getElementById("settingsForm");

  for (const [key, value] of Object.entries(settingsFormInputsSettings)) {
    // Create elements used
    const settingsSliderWrapper = document.createElement("div");
    const settingsSliderInfoWrapper = document.createElement("div");
    const inputInfoName = document.createElement("span");
    const inputInfoValue = document.createElement("span");
    const settingsSlider = document.createElement("input");

    // Match appropriate classes
    settingsSliderWrapper.classList.add("settings-slider-wrapper");
    settingsSliderInfoWrapper.classList.add("settings-slider-info-wrapper");
    settingsSlider.classList.add("settings-slider");

    // Add to document
    settingsForm.appendChild(settingsSliderWrapper);
    settingsSliderWrapper.appendChild(settingsSliderInfoWrapper);
    settingsSliderInfoWrapper.appendChild(inputInfoName);
    settingsSliderInfoWrapper.appendChild(inputInfoValue);
    settingsSliderWrapper.appendChild(settingsSlider);
    // settingsForm.appendChild(settingsSliderWrapper);

    // Put name
    inputInfoName.innerText = value.name;

    // Set types for the settings slider
    settingsSlider.type = "range";
    settingsSlider.name = key;
    settingsSlider.min = value.min;
    settingsSlider.max = value.max;
    settingsSlider.step = 1;

    // Set initial value
    switch (value.type) {
      case "mins":
        settingsSlider.value = (SETTINGS[key] - TIMER_PADDING) / 60 / 1000;
        break;
      case "rounds":
        settingsSlider.value = SETTINGS[key];
        break;
    }

    updateSettingsSlider();
    settingsSlider.addEventListener("input", async () => {
      updateSettingsSlider();
      await sendMessage("update_settings", SETTINGS);
      Object.assign(STATE, await sendMessage("get_state"));
    });

    function updateSettingsSlider() {
      switch (value.type) {
        case "mins":
          inputInfoValue.innerText = durationToString(
            settingsSlider.value * 60 * 1000 + TIMER_PADDING,
            { isVerbose: true }
          );

          SETTINGS[key] = settingsSlider.value * 60 * 1000 + TIMER_PADDING;
          break;
        case "rounds":
          inputInfoValue.innerText =
            settingsSlider.value +
            " round" +
            (settingsSlider.value > 1 ? "s" : "");
          SETTINGS[key] = settingsSlider.value;
          break;
      }
    }
  }
}
