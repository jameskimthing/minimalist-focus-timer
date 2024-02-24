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
})();

function updateRangeInputSteps(rangeInputs, step) {
  for (const rangeInput of rangeInputs) {
    const inputType = rangeInput.getAttribute("type");
    if (inputType === "rounds") continue;

    console.log("set step to: " + step);
    rangeInput.setAttribute("step", step);
  }
}
