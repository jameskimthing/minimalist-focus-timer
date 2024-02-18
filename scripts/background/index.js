// Bug exploit to keep service worker alive
// const keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 20e3);
// chrome.runtime.onStartup.addListener(keepAlive);
// keepAlive();

// ---------------------------------------------------------------------------------------------------------------------------------
// INITIALIZE VALUES ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------
/** Inidicates if all values are initialized. To wait, use the `ensureInitialized()` function */
let INITIALIZED = false;
(async () => {
  Object.assign(SETTINGS, await getStorage("SETTINGS"));

  // For debugging:
  // SETTINGS.workSessionLength = 0.1 * 60 * 1000 + TIMER_PADDING;
  // SETTINGS.breakSessionLength = 0.1 * 60 * 1000 + TIMER_PADDING;
  // SETTINGS.longBreakSessionLength = 0.1 * 60 * 1000 + TIMER_PADDING;

  Object.assign(STATE, {
    isPaused: true,
    startTime: Date.now(),
    pauseStartTime: Date.now(),
    totalPausedTime: 0,
    currentPausedTime: 0,
    sessionType: "WORK", // 'WORK', 'BREAK', 'LONG_BREAK',
    sessionLength: SETTINGS.workSessionLength,
    currentSessionRound: 1,
  });

  INITIALIZED = true;

  // chrome.action.setIcon({ path: "../../something.png" });
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
    STATE.currentPausedTime = Date.now() - STATE.pauseStartTime;
    return;
  }

  const elapsedTime = Date.now() - STATE.startTime - STATE.totalPausedTime;
  const timeLeft = Math.max(STATE.sessionLength - elapsedTime, 0);

  adjustExtensionToPieIconIfNecessary(timeLeft);

  // Change session type, as finished current session
  if (timeLeft <= 0) {
    switch (STATE.sessionType) {
      case "WORK":
        if (STATE.currentSessionRound >= SETTINGS.sessionRounds) {
          STATE.sessionType = "LONG_BREAK";
          STATE.sessionLength = SETTINGS.longBreakSessionLength;

          pushNotification({
            title: `Focus time finished`,
            message: `Completed work round ${STATE.currentSessionRound} / ${SETTINGS.sessionRounds}. Take a long break`,
          });
        } else {
          STATE.sessionType = "BREAK";
          STATE.sessionLength = SETTINGS.breakSessionLength;

          pushNotification({
            title: `Focus time finished`,
            message: `Completed work round ${STATE.currentSessionRound} / ${SETTINGS.sessionRounds}. Take a break`,
          });
        }
        break;
      case "BREAK":
        STATE.sessionType = "WORK";
        STATE.sessionLength = SETTINGS.workSessionLength;
        STATE.currentSessionRound++;

        pushNotification({
          title: `Break time finished`,
          message: `Starting work session ${STATE.currentSessionRound} / ${SETTINGS.sessionRounds}`,
        });
        break;
      case "LONG_BREAK":
        STATE.isPaused = true;
        STATE.isFinished = true;
        adjustExtensionToDefaultIconIfNecessary(STATE.sessionType, 32);
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
// message = { action, content }
chrome.runtime.onMessage.addListener(receiveMessage);
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
        Object.assign(SETTINGS, message.content);
        await setStorage("SETTINGS", SETTINGS);

        // Update STATE accordingly after SETTINGS change
        switch (STATE.sessionType) {
          case "WORK":
            STATE.sessionLength = SETTINGS.workSessionLength;
            break;
          case "BREAK":
            STATE.sessionLength = SETTINGS.breakSessionLength;
            break;
          case "LONG_BREAK":
            STATE.sessionLength = SETTINGS.longBreakSessionLength;
            break;
        }

        STATE.softReset();
        sendResponse();
        break;
      case "update_state":
        Object.assign(STATE, message.content);
        sendResponse();
        break;
      case "toggle_play_pause":
        if (STATE.isPaused == false) {
          STATE.pauseStartTime = Date.now();
          STATE.isPaused = true;
          await adjustExtensionToDefaultIconIfNecessary(STATE.sessionType, 32);
        } else {
          STATE.totalPausedTime += Date.now() - STATE.pauseStartTime;
          STATE.pauseStartTime = 0;
          STATE.isPaused = false;
          adjustExtensionToPieIconIfNecessary();
          // await adjustExtensionToPieIconIfNecessary({
          //   timeLeft: undefined,
          //   sessionLength: STATE.sessionLength,
          //   sessionType: STATE.sessionType,
          //   force: true,
          // });
        }
        STATE.currentPausedTime = 0;
        sendResponse();
        break;
      case "reset_timer":
        if (message.content.hard) {
          STATE.hardReset();
          await adjustExtensionToDefaultIconIfNecessary(STATE.sessionType, 32);
        } else STATE.softReset();
        sendResponse();
        break;
      case "log":
        console.log(message.content);
        sendResponse();
        break;
      case "error":
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
