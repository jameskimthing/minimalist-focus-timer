// Main initialization
(async () => {
  // initialize settings values and page
  const [settings, state] = await Promise.all([
    sendMessage("get_settings"),
    sendMessage("get_state"),
  ]);

  Object.assign(SETTINGS, settings);
  Object.assign(STATE, state);

  adjustUiToState();
  function updateTimerUi() {
    let timeLeft;
    if (STATE.isFinished) timeLeft = 0;
    else {
      if (STATE.isPaused) {
        STATE.pauseStartTime === null
          ? (STATE.pauseStartTime = Date.now())
          : (STATE.shortPausedDuration = Date.now() - STATE.pauseStartTime);
      } else {
        if (STATE.pauseStartTime !== null) {
          STATE.storedPausedDuration += STATE.shortPausedDuration;
          STATE.pauseStartTime = null;
          STATE.shortPausedDuration = 0;
        }
      }

      STATE.totalPausedDuration =
        STATE.storedPausedDuration + STATE.shortPausedDuration;
      const elapsedTime =
        Date.now() - STATE.startTime - STATE.totalPausedDuration;
      timeLeft = Math.max(STATE.sessionLength - elapsedTime, 0);
    }

    adjustUiToState(timeLeft);
    return requestAnimationFrame(updateTimerUi);
  }
  updateTimerUi();
})();

function adjustUiToState(timeLeft) {
  adjustCurrentSessionColor(STATE.sessionType);
  adjustCircleArc(timeLeft / STATE.sessionLength);
  adjustTimerSessionType(STATE.sessionType);
  adjustTimerTimeLeft(timeLeft);
  adjustPlayPauseButton(STATE.isPaused);
  adjustSessionRound(STATE.sessionRound, SETTINGS.sessionRounds);
}

// ---------------------------------------------------------------------------------------------------------------------------------
// EVENTS MESSAGES -----------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------
// message = { action, content }
if (BROWSER == "chrome") chrome.runtime.onMessage.addListener(receiveMessage);
if (BROWSER == "firefox") browser.runtime.onMessage.addListener(receiveMessage);
function receiveMessage(message, sender, sendResponse) {
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
