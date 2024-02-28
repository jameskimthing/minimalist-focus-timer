let _offscreenMade = false;
if (!_offscreenMade && BROWSER == "chrome") {
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
let lastGenerated = "default:" + STATE.color;
let lastAngle = "";
async function adjustExtensionIcon(timeLeft) {
  if (STATE.isPaused) {
    // Default Icon
    if (lastGenerated === "default:" + STATE.color) return;
    lastGenerated = "default:" + STATE.color;

    if (BROWSER == "chrome") {
      const image = await sendMessage(
        "generate_extension_default_icon",
        { color: STATE.color, size: 32 },
        "offscreen"
      );
      chrome.action.setIcon({ path: image });
    } else if (BROWSER == "firefox") {
      const image = await generateExtensionDefaultIcon(STATE.color, 32);
      browser.browserAction.setIcon({ path: { 32: image } });
    }
  } else {
    // Pie Icon
    const angle = (timeLeft / STATE.sessionLength) * 360;
    const smallChange = Math.abs(lastAngle - angle) < ANGLE_DIFF_GENERATE_ICON;
    if (lastGenerated === "pie:" + STATE.color && smallChange) return;
    lastAngle = angle;
    lastGenerated = "pie:" + STATE.color;

    if (BROWSER == "chrome") {
      const image = await sendMessage(
        "generate_extension_pie_icon",
        { iconAngle: angle, color: STATE.color },
        "offscreen"
      );
      chrome.action.setIcon({ path: image });
    } else if (BROWSER == "firefox") {
      const image = await generateExtensionPieIcon(angle, STATE.color, 32);
      browser.browserAction.setIcon({ path: { 32: image } });
    }
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
  content = JSON.parse(JSON.stringify(content));
  for (const key in content) {
    if (typeof content[key] === "function") {
      delete content[key];
    }
  }

  const message = { action, content, target };
  console.log("[background] sending message to", target, "with action", action);

  let browserHere;
  if (BROWSER == "chrome") {
    browserHere = chrome;
  } else if (BROWSER == "firefox") {
    browserHere = browser;
  }

  try {
    return await new Promise((resolve, reject) => {
      browserHere.runtime.sendMessage(message, (response) => {
        if (browserHere.runtime.lastError) {
          reject(new Error(browserHere.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  } catch (e) {
    // Error only when popup not open; no error when popup open
    const popupNotOpenError =
      "The message port closed before a response was received.";
    const popupNotOpenError2 =
      "Could not establish connection. Receiving end does not exist.";
    if (
      e.message.includes(popupNotOpenError) ||
      e.message.includes(popupNotOpenError2)
    )
      return;
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
  let image;

  if (BROWSER == "chrome") {
    image = await sendMessage(
      "generate_extension_default_icon",
      { color: STATE.color, size: 128 },
      "offscreen"
    );
  } else if (BROWSER == "firefox") {
    image = await generateExtensionDefaultIcon(STATE.color, 128);
  }

  // Play sound
  if (SETTINGS.soundOnNotification) {
    if (BROWSER == "chrome") {
      sendMessage(
        "play_audio",
        "../../assets/sounds/notification.mp3",
        "offscreen"
      );
    } else if (BROWSER == "firefox") {
      const audio = new Audio("/assets/sounds/notification.mp3");
      audio.play();
    }
  }

  // Push Notification
  const notificationMessage = {
    type: "basic",
    iconUrl: image,
    title: options.title,
    message: options.message,
  };
  if (BROWSER == "chrome") {
    chrome.notifications.create("", notificationMessage, (_) => {});
  } else if (BROWSER == "firefox") {
    browser.notifications.create(notificationMessage);
  }
}

// ---------------------------------------------------------------------------------------------------------------------------------
// STORAGE -------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------
async function setStorage(key, value) {
  if (BROWSER == "chrome") {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  } else if (BROWSER == "firefox") {
    return await browser.storage.local.set({ [key]: value });
  }
}

async function getStorage(key) {
  if (BROWSER == "chrome") {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result[key]);
        }
      });
    });
  } else if (BROWSER == "firefox") {
    return await browser.storage.local.get(key);
  }
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
