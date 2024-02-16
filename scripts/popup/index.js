// Notify background page that popup has opened
(async () => {
  document.getElementById("timerPlayPauseButton").innerHTML = SVG_ICONS.play;
  document.getElementById("timerResetButton").innerHTML = SVG_ICONS.reset;
  document.getElementById("settingsPageButton").innerHTML = SVG_ICONS.settings;

  // initialize settings values and page
  const [settings, state] = await Promise.all([
    sendMessage("get_settings"),
    sendMessage("get_state"),
  ]);

  Object.assign(SETTINGS, settings);
  Object.assign(STATE, state);

  console.log("NEW_SETTINGS: " + JSON.stringify(SETTINGS));

  initializeSettingsPage();
  console.log("after settings page: " + JSON.stringify(SETTINGS));

  adjustUiToState();
  console.log("after initial update: " + JSON.stringify(SETTINGS));
  function updateTimerUi() {
    if (STATE.isFinished) return requestAnimationFrame(updateTimerUi);
    if (STATE.isPaused)
      STATE.currentPausedTime = Date.now() - STATE.pauseStartTime;

    adjustUiToState();
    return requestAnimationFrame(updateTimerUi);
  }
  updateTimerUi();
})();

function adjustUiToState() {
  let timeLeft;
  if (STATE.isFinished) timeLeft = 0;
  else {
    const elapsedTime =
      Date.now() -
      STATE.startTime -
      STATE.totalPausedTime -
      STATE.currentPausedTime;
    timeLeft = Math.max(STATE.sessionLength - elapsedTime, 0);
  }

  if (timeLeft < 0) return;

  adjustCurrentSessionColor(STATE.sessionType);
  adjustCircleArc(timeLeft / STATE.sessionLength);
  adjustTimerSessionType(STATE.sessionType);
  adjustTimerTimeLeft(timeLeft);
  adjustPlayPauseButton(STATE.isPaused);
  adjustSessionRound(STATE.currentSessionRound, SETTINGS.sessionRounds);
}

// ---------------------------------------------------------------------------------------------------------------------------------
// EVENTS MESSAGES -----------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------
// message = { action, content }
chrome.runtime.onMessage.addListener(receiveMessageFromBackground);
function receiveMessageFromBackground(message, sender, sendResponse) {
  if (message.target !== "popup") return;
  console.log(`[popup] received message with action ${message.action}`);

  (async () => {
    switch (message.action) {
      case "update_state":
        Object.assign(STATE, message.content);
        sendResponse();
        break;
      default:
        sendResponse();
        break;
    }
  })();

  return true;
}
