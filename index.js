/* jslint node:true */

if (global.System) {
  throw new Error("Conflicts with the global `System` definition, use `es6-micro-loader/lib/system` instead.");
}

module.exports = global.System = require("./lib/system");
