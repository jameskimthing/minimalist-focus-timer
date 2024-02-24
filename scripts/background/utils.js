// TODO
// Doesnt actually need "BLOBS" reason, but is just there so "AUDIO_PLAYBACK" wont be suspended after 30 seconds
chrome.offscreen.createDocument({
  url: chrome.runtime.getURL("../../html/offscreen.html"),
  reasons: ["AUDIO_PLAYBACK", "BLOBS"],
  justification: "notification",
});

// ---------------------------------------------------------------------------------------------------------------------------------
// ADJUST CHROME EXTENSION ICON ----------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------
let oldAngle = 0;
/**
 * Updates the browser extension's icon if the change in time angle since the last update
 * exceeds `ANGLE_DIFF_GENERATE_ICON`. The icon is updated to a "pie" representation of the
 * session's progress with a specific color depending on the session type.
 *
 * @param {number} timeLeft - The amount of time remaining in the current session
 * @param {number} sessionLength - The total length of the current session
 * @param {"WORK" | "BREAK" | "LONG_BREAK"} sessionType - The type of the current session, determining the color of the icon.
 */
async function adjustExtensionToPieIconIfNecessary(timeLeft) {
  if (!timeLeft) {
    const elapsedTime = Date.now() - STATE.startTime - STATE.totalPausedTime;
    timeLeft = Math.max(STATE.sessionLength - elapsedTime, 0);
  }

  const newAngle = (timeLeft / STATE.sessionLength) * 360;
  const isAlreadyPi = STATE.currentExtensionIcon === "PIE";
  const isSmallAngleChange =
    Math.abs(oldAngle - newAngle) < ANGLE_DIFF_GENERATE_ICON;

  if (isAlreadyPi && isSmallAngleChange) return;

  oldAngle = newAngle;
  STATE.currentExtensionIcon = "PIE";

  const image = await sendMessage(
    "generate_extension_pie_icon",
    { iconAngle: newAngle, color: STATE.color },
    "offscreen"
  );
  chrome.action.setIcon({ path: image });
}

/**
 * Changes to the current default icon (shown when session is paused or finished).
 * Does nothing if it is already that icon (with matching colors)
 */
async function adjustExtensionToDefaultIconIfNecessary(sessionType, size) {
  STATE.currentExtensionIcon = "DEFAULT";
  const image = await sendMessage(
    "generate_extension_default_icon",
    { color: STATE.color, size },
    "offscreen"
  );
  chrome.action.setIcon({ path: image });
}

// ---------------------------------------------------------------------------------------------------------------------------------
// SEND MESSAGE TO popup / offscreen -----------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------

/**
 * Sends a message to popup
 *
 * @param {string} action - Action, such as `update_state`
 * @param {*} content - The payload of the message, if any.
 * @param {"popup" | "offscreen"} target
 */
async function sendMessage(action, content, target = "popup") {
  const message = { action, content, target };
  console.log("[background] sending message to", target, "with action", action);

  try {
    return await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  } catch (e) {
    // Error only when popup not open; no error when popup open
    const popupNotOpenError =
      "The message port closed before a response was received.";
    if (e.message.includes(popupNotOpenError)) return;
    throw e;
  }
}

// ---------------------------------------------------------------------------------------------------------------------------------
// PUSH NOTIFICAtION ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------
/**
 * Pushes a notification to the user.
 * @param {Object} options Some paremeters
 * @param {string} options.title The title of the notification.
 * @param {string} options.message The message body of the notification.
 */
async function pushNotification(options) {
  if (STATE.dontShowNextPopup) {
    STATE.dontShowNextPopup = false;
    return;
  }

  const image = await sendMessage(
    "generate_extension_default_icon",
    { color: STATE.color, size: 128 },
    "offscreen"
  );
  sendMessage(
    "play_audio",
    "../../assets/sounds/notification.mp3",
    "offscreen"
  );
  chrome.notifications.create(
    "",
    {
      type: "basic",
      title: options.title,
      iconUrl: image,
      message: options.message,
    },
    (_) => {}
  );
}

// ---------------------------------------------------------------------------------------------------------------------------------
// USING chrome.storage.local ------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------
async function setStorage(key, value) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

function getStorage(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[key]);
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
 * @param {Date | number} duration
 * @param {Object} options
 * @param {boolean} options.isVerbose
 * @returns {string}
 */
function durationToString(duration, options = { isVerbose: true }) {
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
