// ---------------------------------------------------------------------------------------------------------------------------------
// INITIALIZE VALUES ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------
/** Inidicates if all values are initialized. To wait, use the `ensureInitialized()` function */
let INITIALIZED = false;
(async () => {
  Object.assign(SETTINGS, await getStorage("SETTINGS"));
  Object.assign(STATE, {
    isPaused: true,
    startTime: Date.now(),
    pauseStartTime: null,
    storedPausedDuration: 0,
    shortPausedDuration: 0,
    totalPausedDuration: 0,
    sessionType: "WORK", // 'WORK', 'BREAK', 'LONG_BREAK',
    sessionRound: 1,
  });

  INITIALIZED = true;
})();

/** Waits until all values are initialized */
async function ensureInitialized() {
  while (!INITIALIZED) {
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

// ---------------------------------------------------------------------------------------------------------------------------------
// MAIN LOOP -----------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------
setInterval(() => {
  if (!INITIALIZED) return;

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
  const elapsedTime = Date.now() - STATE.startTime - STATE.totalPausedDuration;
  const timeLeft = Math.max(STATE.sessionLength - elapsedTime, 0);

  adjustExtensionIcon(timeLeft);

  if (timeLeft <= 0 && !STATE.isFinished) {
    switch (STATE.sessionType) {
      case "WORK":
        STATE.isPaused = SETTINGS.sessionAutoPauseAfterWork;
        if (STATE.sessionRound >= SETTINGS.sessionRounds) {
          STATE.sessionType = "LONG_BREAK";
          pushNotification({
            title: `Focus time finished`,
            message: `Completed work round ${STATE.sessionRound} / ${SETTINGS.sessionRounds}. Take a long break`,
          });
        } else {
          STATE.sessionType = "BREAK";
          pushNotification({
            title: `Focus time finished`,
            message: `Completed work round ${STATE.sessionRound} / ${SETTINGS.sessionRounds}. Take a break`,
          });
        }
        break;
      case "BREAK":
        STATE.isPaused = SETTINGS.sessionAutoPauseAfterBreak;
        STATE.sessionType = "WORK";
        STATE.sessionRound++;
        pushNotification({
          title: `Break time finished`,
          message: `Starting work session ${STATE.sessionRound} / ${SETTINGS.sessionRounds}`,
        });
        break;
      case "LONG_BREAK":
        STATE.isPaused = true;
        STATE.isFinished = true;
        pushNotification({
          title: `All session rounds completed`,
          message: `Finished a total of ${SETTINGS.sessionRounds} rounds`,
        });
        break;
    }

    if (!STATE.isFinished) STATE.softReset();
    sendMessage("update_state", STATE, "popup");
  }
}, 50);

// ---------------------------------------------------------------------------------------------------------------------------------
// EVENTS MESSAGES -----------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------
if (BROWSER == "chrome") chrome.runtime.onMessage.addListener(receiveMessage);
if (BROWSER == "firefox") browser.runtime.onMessage.addListener(receiveMessage);
function receiveMessage(message, sender, sendResponse) {
  if (message.target !== "background") return;

  if (message.action !== "log" && message.action !== "error") {
    console.log(`[background] received message with action ${message.action}`);
  }

  (async () => {
    await ensureInitialized();
    switch (message.action) {
      case "get_settings":
        sendResponse(SETTINGS);
        break;
      case "get_state":
        sendResponse(STATE);
        break;
      case "update_settings":
        const prevSettings = JSON.parse(JSON.stringify(SETTINGS));
        Object.assign(SETTINGS, message.content);
        await setStorage("SETTINGS", SETTINGS);

        for (const sessionType of ["WORK", "BREAK", "LONG_BREAK"]) {
          if (
            STATE.sessionType === sessionType &&
            prevSettings.sessionLength[sessionType] !==
              SETTINGS.sessionLength[sessionType]
          ) {
            STATE.softReset();
          }
        }
        // if (STATE.sessionType === 'WORK' && prevSettings.sessionLength['WORK'])

        sendResponse();
        break;
      case "update_state":
        Object.assign(STATE, message.content);
        sendResponse();
        break;
      case "toggle_play_pause":
        if (STATE.isFinished) {
          sendResponse();
          break;
        }
        STATE.isPaused = !STATE.isPaused;
        sendResponse();
        break;
      case "skip_session":
        if (STATE.isFinished) {
          sendResponse();
          break;
        }

        switch (STATE.sessionType) {
          case "WORK":
            STATE.sessionRound >= SETTINGS.sessionRounds
              ? (STATE.sessionType = "LONG_BREAK")
              : (STATE.sessionType = "BREAK");
            STATE.isPaused = SETTINGS.sessionAutoPauseAfterWork;
            break;
          case "BREAK":
            STATE.sessionType = "WORK";
            STATE.sessionRound++;
            STATE.isPaused = SETTINGS.sessionAutoPauseAfterBreak;
            break;
          case "LONG_BREAK":
            STATE.isPaused = true;
            STATE.isFinished = true;
            break;
        }

        STATE.softReset();
        sendResponse();
        break;
      case "reset_timer":
        if (message.content.hard) STATE.hardReset();
        else STATE.softReset();
        sendResponse();
        break;
      case "log":
        // For debugging
        console.log(message.content);
        sendResponse();
        break;
      case "error":
        // For debugging
        console.error(message.content);
        sendResponse();
        break;
      default:
        sendResponse();
        break;
    }
  })();

  return true;
}
