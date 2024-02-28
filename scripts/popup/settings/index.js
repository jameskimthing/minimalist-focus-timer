let INITIALIZED = false;
(async () => {
  const settings = await sendMessage("get_settings");
  Object.assign(SETTINGS, settings);
  INITIALIZED = true;
})();

async function ensureInitialized() {
  while (!INITIALIZED) {
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}
