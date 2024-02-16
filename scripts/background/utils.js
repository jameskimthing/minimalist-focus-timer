// TODO
// Doesnt actually need "BLOBS" reason, but is just there so "AUDIO_PLAYBACK" wont be suspended after 30 seconds
chrome.offscreen.createDocument({
  url: chrome.runtime.getURL("../../assets/offscreen/offscreen.html"),
  reasons: ["AUDIO_PLAYBACK", "BLOBS"],
  justification: "notification",
});

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
function pushNotification(options) {
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
      iconUrl: "../../default.png",
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
