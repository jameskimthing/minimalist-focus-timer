try {
  importScripts(
    "/scripts/background/values.js",
    "/scripts/background/utils.js",
    "/scripts/background/index.js"
  );
} catch (e) {
  console.error(e);
}
