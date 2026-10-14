// Some restricted Windows environments reject the native async realpath call
// even when Node's synchronous resolver can resolve the same existing file.
// Keep dependency/type checks enabled and propagate every other error.
const fs = require("node:fs");

function withWindowsRealpathFallback(realpath, realpathSync, platform) {
  return async (file, options) => {
    try {
      return await realpath(file, options);
    } catch (error) {
      if (platform !== "win32" || error.code !== "EPERM") throw error;
      return realpathSync(file, options);
    }
  };
}

if (process.platform === "win32") {
  fs.promises.realpath = withWindowsRealpathFallback(
    fs.promises.realpath.bind(fs.promises),
    fs.realpathSync.bind(fs),
    process.platform,
  );
}

module.exports = { withWindowsRealpathFallback };
