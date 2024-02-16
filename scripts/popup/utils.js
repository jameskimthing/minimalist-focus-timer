// ---------------------------------------------------------------------------------------------------------------------------------
// SEND MESSAGE TO background/index.js ---------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------

/**
 * Sends a message using the Chrome extension messaging API and returns a Promise.
 *
 * @param {string} action - Action, such as `get_state` or `update_settings`
 * @param {*} content - The payload of the message, if any.
 * @param {"background" | "offscreen"} target
 */
async function sendMessage(action, content, target = "background") {
  const message = { action, content, target };
  console.log("[popup] sending message to", target, "with action", action);

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

// ---------------------------------------------------------------------------------------------------------------------------------
// GENERAL -------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------
/**
 * NOTE: if `isVerbose = false`, `minutes` and `seconds` are always shown, but `hours` is conditionally shown
 *
 * The one in /background defaults `isVerbose = true`, while /popup defaults to `isVerbose = false`
 * @param {Date | number} duration - A duration
 * @param {Object} options
 * @param {boolean} options.isVerbose
 * @returns {string} - The string representation of the duration.
 */
function durationToString(duration, options = { isVerbose: false }) {
  const hours = Math.floor(duration / 1000 / 60 / 60);
  const minutes = Math.floor(duration / 1000 / 60) % 60;
  const seconds = Math.floor(duration / 1000) % 60;

  const parts = [];
  if (options.isVerbose) {
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
    if (seconds > 0) parts.push(`${seconds} second${seconds > 1 ? "s" : ""}`);

    return parts.join(" ");
  } else {
    if (hours) parts.push(String(hours).padStart(2, "0"));
    parts.push(String(minutes).padStart(2, "0"));
    parts.push(String(seconds).padStart(2, "0"));

    return parts.join(" : ");
  }
}

// ---------------------------------------------------------------------------------------------------------------------------------
// ADJUSTING UI TO MATCH STATE -----------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------
let lastAdjustRatio;
const circle = document.getElementById("partialCircle");
function adjustCircleArc(ratio) {
  if (ratio === lastAdjustRatio) return;
  lastAdjustRatio = ratio;

  if (ratio === 0) circle.style.stroke = "transparent";
  else circle.style.stroke = "var(--color-current-session)";
  const circumference = 2 * Math.PI * circle.r.baseVal.value;
  const strokeDasharray = circumference * ratio;
  circle.style.strokeDasharray = `${strokeDasharray} ${circumference}`;
  circle.style.transform = `rotate(${-90 - 360 * ratio}deg)`;
}

let lastCurrentSessionTypeColor;
function adjustCurrentSessionColor(sessionType) {
  if (lastCurrentSessionTypeColor === sessionType) return;
  lastCurrentSessionTypeColor = sessionType;

  switch (sessionType) {
    case "WORK":
      document.documentElement.style.setProperty(
        "--color-current-session",
        "var(--color-session-work)"
      );
      break;
    case "BREAK":
      document.documentElement.style.setProperty(
        "--color-current-session",
        "var(--color-session-break)"
      );
      break;
    case "LONG_BREAK":
      document.documentElement.style.setProperty(
        "--color-current-session",
        "var(--color-session-long-break)"
      );
      break;
  }
}

const sessionTypeElement = document.getElementById("sessionLabel");
function adjustTimerSessionType(sessionType) {
  let sessionTypeText = "";
  switch (sessionType) {
    case "WORK":
      sessionTypeText = "Focus Time";
      break;
    case "BREAK":
      sessionTypeText = "Short Break";
      break;
    case "LONG_BREAK":
      sessionTypeText = "Long Break";
      break;
  }

  sessionTypeElement.innerText = sessionTypeText;
}

let lastAdjustTime;
const timerElement = document.getElementById("sessionTimeLeft");
function adjustTimerTimeLeft(time) {
  if (lastAdjustTime === time) return;
  lastAdjustTime = time;

  // timerElement.style.color = getCurrentSessionColor();
  timerElement.innerText = durationToString(time, { isVerbose: false });
}

let lastAdjustPaused;
const timerPlayPauseImage = document.getElementById("timerPlayPauseButton");
function adjustPlayPauseButton(paused) {
  if (lastAdjustPaused === paused) return;
  lastAdjustPaused = paused;

  if (paused) timerPlayPauseImage.innerHTML = SVG_ICONS.play;
  else timerPlayPauseImage.innerHTML = SVG_ICONS.pause;
}

let lastAdjustSessionRound;
let lastAdjustMaxSessionRound;
const sessionRound = document.getElementById("sessionCurrentRound");
function adjustSessionRound(currentSessionRound, maxSessionRounds) {
  if (
    lastAdjustSessionRound === currentSessionRound &&
    lastAdjustMaxSessionRound === maxSessionRounds
  ) {
    return;
  }
  lastAdjustSessionRound = currentSessionRound;
  lastAdjustMaxSessionRound = maxSessionRounds;
  console.log(SETTINGS);

  sessionRound.innerText = `${currentSessionRound} / ${maxSessionRounds}`;
}
