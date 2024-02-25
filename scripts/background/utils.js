let _offscreenMade = false;
if (!_offscreenMade) {
  // Doesnt actually need "BLOBS" reason, but is just there so "AUDIO_PLAYBACK" wont be suspended after 30 seconds
  chrome.offscreen.createDocument({
    url: chrome.runtime.getURL("../../html/offscreen.html"),
    reasons: ["AUDIO_PLAYBACK", "BLOBS"],
    justification: "notification",
  });
  _offscreenMade = true;
}

// ---------------------------------------------------------------------------------------------------------------------------------
// ADJUST CHROME EXTENSION ICON ----------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------
let lastGenerated = "";
let lastAngle = "";
async function adjustExtensionIcon(timeLeft) {
  if (STATE.isPaused) {
    // Default Icon
    if (lastGenerated === "default:" + STATE.color) return;

    const image = await sendMessage(
      "generate_extension_default_icon",
      { color: STATE.color, size: 32 },
      "offscreen"
    );
    chrome.action.setIcon({ path: image });

    lastGenerated = "default:" + STATE.color;
  } else {
    // Pie Icon
    const angle = (timeLeft / STATE.sessionLength) * 360;
    const smallChange = Math.abs(lastAngle - angle) < ANGLE_DIFF_GENERATE_ICON;
    if (lastGenerated === "pie:" + STATE.color && smallChange) return;

    const image = await sendMessage(
      "generate_extension_pie_icon",
      { iconAngle: angle, color: STATE.color },
      "offscreen"
    );
    chrome.action.setIcon({ path: image });

    lastAngle = angle;
    lastGenerated = "pie:" + STATE.color;
  }
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
  const image = await sendMessage(
    "generate_extension_default_icon",
    { color: STATE.color, size: 128 },
    "offscreen"
  );

  if (SETTINGS.soundOnNotification) {
    sendMessage(
      "play_audio",
      "../../assets/sounds/notification.mp3",
      "offscreen"
    );
  }
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
