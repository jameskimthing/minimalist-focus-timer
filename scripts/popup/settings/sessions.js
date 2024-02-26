(async () => {
  await ensureInitialized();
  const rangeInputs = document.querySelectorAll("range-input");

  // ---------------------------------------------------------------------------------------------------------------------------------
  // RANGE INPUTS --------------------------------------------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------------------------------------------------------
  const rangeWorkLength = document.getElementById("rangeWorkLength");
  const rangeBreakLength = document.getElementById("rangeBreakLength");
  const rangeLongBreakLength = document.getElementById("rangeLongBreakLength");
  const rangeRounds = document.getElementById("rangeRounds");

  updateRangeInput(rangeWorkLength);
  updateRangeInput(rangeBreakLength);
  updateRangeInput(rangeLongBreakLength);
  updateRangeInput(rangeRounds);

  // FUNCTIONS -----------------------------------------------------------------------------------------------------------------------
  function updateRangeInput(element) {
    const type = element.getAttribute("type");
    const key = element.getAttribute("key");

    const val = (SETTINGS.sessionLength[key] - TIMER_PADDING) / 60 / 1000;
    type === "mins"
      ? element.setAttribute("value", val)
      : element.setAttribute("value", SETTINGS[key]);

    element.addEventListener("range-input", (event) => {
      const val = event.detail.value * 60 * 1000 + TIMER_PADDING;
      type === "mins"
        ? (SETTINGS.sessionLength[key] = val)
        : (SETTINGS[key] = event.detail.value);
      sendMessage("update_settings", SETTINGS);
    });
  }

  // ---------------------------------------------------------------------------------------------------------------------------------
  // CHECKBOXES ----------------------------------------------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------------------------------------------------------
  const pauseAfterWork = document.getElementById("autoPauseAfterWork");
  const pauseAfterBreak = document.getElementById("autoPauseAfterBreak");
  const soundOnNotification = document.getElementById("soundOnNotification");
  const stepsByFive = document.getElementById("stepsByFive");

  updateCheckbox(pauseAfterWork, true, "sessionAutoPauseAfterWork");
  updateCheckbox(pauseAfterBreak, true, "sessionAutoPauseAfterBreak");
  updateCheckbox(soundOnNotification, true, "soundOnNotification");
  updateCheckbox(stepsByFive, 5, "sessionInputRangeStep", (checked) => {
    checked == "true"
      ? (SETTINGS.sessionInputRangeStep = 5)
      : (SETTINGS.sessionInputRangeStep = 1);
    updateRangeInputSteps();
  });
  if (SETTINGS.sessionInputRangeStep === 5) updateRangeInputSteps();

  // FUNCTIONS -----------------------------------------------------------------------------------------------------------------------
  function updateRangeInputSteps() {
    for (const rangeInput of rangeInputs) {
      const inputType = rangeInput.getAttribute("type");
      if (inputType === "rounds") continue;
      rangeInput.setAttribute("step", SETTINGS.sessionInputRangeStep);
    }
  }
  /** Updates "checked" state of checkbox whenever clicked, matches SETTINGS */
  function updateCheckbox(element, checkedValue, settingsAttribute, onClick) {
    if (SETTINGS[settingsAttribute] === checkedValue) {
      element.setAttribute("checked", "true");
    }
    element.addEventListener("checkbox-input", async (event) => {
      onClick
        ? onClick(event.detail.value)
        : (SETTINGS[settingsAttribute] = !SETTINGS[settingsAttribute]);
      sendMessage("update_settings", SETTINGS);
    });
  }
})();
