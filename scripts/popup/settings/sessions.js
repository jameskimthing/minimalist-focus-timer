(async () => {
  await ensureInitialized();
  const rangeInputs = document.querySelectorAll("range-input");
  const stepsByFive = document.getElementById("stepsByFive");

  if (SETTINGS.sessionInputRangeStep === 5) {
    stepsByFive.setAttribute("checked", "true");
    updateRangeInputSteps(rangeInputs, SETTINGS.sessionInputRangeStep);
  }

  stepsByFive.addEventListener("click", async () => {
    if (stepsByFive.getAttribute("checked")) {
      stepsByFive.removeAttribute("checked");
      SETTINGS.sessionInputRangeStep = 1;
    } else {
      stepsByFive.setAttribute("checked", "true");
      SETTINGS.sessionInputRangeStep = 5;
    }

    console.log(SETTINGS);

    updateRangeInputSteps(rangeInputs, SETTINGS.sessionInputRangeStep);
    sendMessage("update_settings", SETTINGS);
  });

  // ---------------------------------------------------------------------------------------------------------------------------------
  // BUTTONS -------------------------------------------------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------------------------------------------------------
  const pauseAfterWork = document.getElementById("autoPauseAfterWork");
  const pauseAfterBreak = document.getElementById("autoPauseAfterBreak");
  const soundOnNotification = document.getElementById("soundOnNotification");

  if (SETTINGS.sessionAutoPauseAfterWork)
    pauseAfterWork.setAttribute("checked", "true");
  pauseAfterWork.addEventListener("click", async () => {
    SETTINGS.sessionAutoPauseAfterWork = !SETTINGS.sessionAutoPauseAfterWork;
    pauseAfterWork.getAttribute("checked")
      ? pauseAfterWork.removeAttribute("checked")
      : pauseAfterWork.setAttribute("checked", "true");
    sendMessage("update_settings", SETTINGS);
  });

  if (SETTINGS.sessionAutoPauseAfterBreak)
    pauseAfterBreak.setAttribute("checked", "true");
  pauseAfterBreak.addEventListener("click", async () => {
    SETTINGS.sessionAutoPauseAfterBreak = !SETTINGS.sessionAutoPauseAfterBreak;
    pauseAfterBreak.getAttribute("checked")
      ? pauseAfterBreak.removeAttribute("checked")
      : pauseAfterBreak.setAttribute("checked", "true");
    sendMessage("update_settings", SETTINGS);
  });

  if (SETTINGS.soundOnNotification)
    soundOnNotification.setAttribute("checked", "true");
  soundOnNotification.addEventListener("click", async () => {
    SETTINGS.soundOnNotification = !SETTINGS.soundOnNotification;
    soundOnNotification.getAttribute("checked")
      ? soundOnNotification.removeAttribute("checked")
      : soundOnNotification.setAttribute("checked", "true");
    sendMessage("update_settings", SETTINGS);
  });
})();

function updateRangeInputSteps(rangeInputs, step) {
  for (const rangeInput of rangeInputs) {
    const inputType = rangeInput.getAttribute("type");
    if (inputType === "rounds") continue;
    rangeInput.setAttribute("step", step);
  }
}
