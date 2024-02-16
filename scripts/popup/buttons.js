const timerPlayPauseButton = document.getElementById("timerPlayPauseButton");
timerPlayPauseButton.addEventListener("click", async () => {
  await sendMessage("toggle_play_pause");
  const state = await sendMessage("get_state");
  Object.assign(STATE, state);
});

const timerResetButton = document.getElementById("timerResetButton");
timerResetButton.addEventListener("click", async () => {
  await sendMessage("reset_timer");
  const state = await sendMessage("get_state");
  Object.assign(STATE, state);
});

const settingsPageButton = document.getElementById("settingsPageButton");
settingsPageButton.addEventListener("click", () => {
  settingsPage.classList.toggle("active");
});
