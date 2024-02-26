// ---------------------------------------------------------------------------------------------------------------------------------
// ONLY USED IN CHROME -------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------

// ---------------------------------------------------------------------------------------------------------------------------------
// KEEP BACKGROUND SERVICE WORKER ALIVE --------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------
setInterval(async () => sendMessage("keep_alive", "", "background"), 20e3);

// ---------------------------------------------------------------------------------------------------------------------------------
// LISTEN TO MESSAGES --------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------
if (BROWSER == "chrome") chrome.runtime.onMessage.addListener(receiveMessage);
if (BROWSER == "firefox") browser.runtime.onMessage.addListener(receiveMessage);
function receiveMessage(message, sender, sendResponse) {
  if (message.target !== "offscreen") return;

  (async () => {
    if (message.action !== "generate_extension_pie_icon") {
      await sendMessage(
        "log",
        `[offscreen] received message with action ${message.action}`,
        "background"
      );
    }
    switch (message.action) {
      case "play_audio":
        const audioTag = document.getElementById("audioTag");
        const audioSource = document.getElementById("audioSource");
        audioSource.src = message.content;
        audioTag.load();
        audioTag.play();
        sendResponse();
        break;
      case "generate_extension_pie_icon":
        const { iconAngle, color, size: pieSize } = message.content;
        const image = await generateExtensionPieIcon(iconAngle, color, pieSize);
        sendResponse(image);
        break;
      case "generate_extension_default_icon":
        const { color: stateColor, size } = message.content;
        const defaultImage = await generateExtensionDefaultIcon(
          stateColor,
          size
        );
        sendResponse(defaultImage);
        break;
      default:
        sendResponse();
        break;
    }
  })();

  return true;
}

// ---------------------------------------------------------------------------------------------------------------------------------
// SEND A MESSAGE ------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------
/**
 * Sends a message using the Chrome extension messaging API and returns a Promise.
 *
 * @param {string} action - Action, such as `keep_alive`
 * @param {*} content - The payload of the message, if any.
 * @param {"background" | "offscreen"} target
 */
async function sendMessage(action, content, target = "background") {
  const message = { action, content, target };
  console.log("[popup] sending message to", target, "with action", action);

  // no need to think of sending in firefox env, as that is not
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
