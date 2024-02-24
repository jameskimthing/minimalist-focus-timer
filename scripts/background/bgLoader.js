try {
  // The load order of scripts. Not doing this and using javacript
  // from the one of the imported scripts gives an error for some
  // reason. Was unable to fix that, this is the solution
  importScripts(
    "/scripts/values.js",
    "/scripts/background/utils.js",
    "/scripts/background/index.js"
  );
} catch (e) {
  console.error(e);
}
