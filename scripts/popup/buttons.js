// Adds event listeners to buttons

const timerPlayPauseButton = document.getElementById("timerPlayPauseButton");
timerPlayPauseButton.addEventListener("click", async () => {
  await sendMessage("toggle_play_pause");
  const state = await sendMessage("get_state");
  Object.assign(STATE, state);
});

const timerSoftResetButton = document.getElementById("timerSoftResetButton");
timerSoftResetButton.addEventListener("click", async () => {
  await sendMessage("reset_timer", { hard: false });
  const state = await sendMessage("get_state");
  Object.assign(STATE, state);
});

const timerSkipButton = document.getElementById("timerSkipButton");
timerSkipButton.addEventListener("click", async () => {
  await sendMessage("skip_session");
  const state = await sendMessage("get_state");
  Object.assign(STATE, state);
});

const timerHardResetButton = document.getElementById("timerHardResetButton");
timerHardResetButton.addEventListener("click", async () => {
  await sendMessage("reset_timer", { hard: true });
  const state = await sendMessage("get_state");
  Object.assign(STATE, state);
});

// const settingsPageButton = document.getElementById("settingsPageButton");
// settingsPageButton.addEventListener("click", () => {
//   settingsPage.classList.toggle("active");
// });
