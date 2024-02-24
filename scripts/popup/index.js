// Main initialization
(async () => {
  // initialize settings values and page
  const [settings, state] = await Promise.all([
    sendMessage("get_settings"),
    sendMessage("get_state"),
  ]);

  Object.assign(SETTINGS, settings);
  Object.assign(STATE, state);

  // Using `SETTINGS`, adjusts the settings ui and adds event listeners to each input
  // initializeSettingsPage();

  adjustUiToState();
  function updateTimerUi() {
    if (STATE.isFinished) return requestAnimationFrame(updateTimerUi);
    if (STATE.isPaused)
      STATE.currentPausedTime = Date.now() - STATE.pauseStartTime;

    adjustUiToState();
    return requestAnimationFrame(updateTimerUi);
  }
  updateTimerUi();
})();

/**
 * Adjusts the ui (e.g. color, circle arc, time left, and so on)
 */
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

// function downloadImage(base64Data, filename) {
//   try {
//     const element = document.createElement("a");
//     element.setAttribute("href", base64Data);
//     element.setAttribute("download", filename);
//     document.body.appendChild(element);
//     element.click();
//     document.body.removeChild(element);
//   } catch (e) {
//     console.log(e);
//   }
// }

// (async () => {
//   await new Promise((resolve) => setTimeout(resolve, 1000));
//   const images = await Promise.all([
//     sendMessage(
//       "generate_extension_pie_icon",
//       { iconAngle: 270, color: "#0197f6", size: 128 },
//       "offscreen"
//     ),
//     sendMessage(
//       "generate_extension_pie_icon",
//       { iconAngle: 270, color: "#70b77e", size: 128 },
//       "offscreen"
//     ),
//     sendMessage(
//       "generate_extension_pie_icon",
//       { iconAngle: 270, color: "#eb5e28", size: 128 },
//       "offscreen"
//     ),
//   ]);

//   let index = 0;
//   for (const image of images) {
//     console.log(image);
//     downloadImage(image, `icon-${index}.png`);
//     index++;
//   }
// })();
