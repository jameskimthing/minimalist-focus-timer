// ---------------------------------------------------------------------------------------------------------------------------------
// SEND MESSAGE TO background/index.js ---------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------

/**
 * Sends a message using the Chrome extension messaging API and returns a Promise
 *
 * @param {string} action - Action, such as `get_state` or `update_settings`
 * @param {*} content - The payload of the message, if any.
 * @param {"background" | "offscreen"} target - Goes to "background" by default
 */
async function sendMessage(action, content, target = "background") {
  const message = { action, content, target };
  console.log("[popup] sending message to", target, "with action", action);

  let browserHere;
  if (BROWSER == "chrome") {
    browserHere = chrome;
  } else if (BROWSER == "firefox") {
    browserHere = browser;
  }

  return await new Promise((resolve, reject) => {
    browserHere.runtime.sendMessage(message, (response) => {
      if (browserHere.runtime.lastError) {
        reject(new Error(browserHere.runtime.lastError.message));
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
