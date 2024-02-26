// Adds event listeners to buttons
const timerPlayPauseButton = document.getElementById("timerPlayPauseButton");
const timerSoftResetButton = document.getElementById("timerSoftResetButton");
const timerSkipButton = document.getElementById("timerSkipButton");
const timerHardResetButton = document.getElementById("timerHardResetButton");

initiializeButton(timerPlayPauseButton, "toggle_play_pause");
initiializeButton(timerSoftResetButton, "reset_timer", { hard: false });
initiializeButton(timerSkipButton, "skip_session");
initiializeButton(timerHardResetButton, "reset_timer", { hard: true });

function initiializeButton(button, message, messageOptions) {
  button.addEventListener("click", async () => {
    await sendMessage(message, messageOptions);
    const state = await sendMessage("get_state");
    Object.assign(STATE, state);
  });
}
