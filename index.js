/* jslint node:true */

if (global.System) {
  throw new Error("Conflicts with the global `System` definition, use `es6-micro-loader/lib/system` instead.");
}

global.Promise = global.Promise || require("es6-promise").Promise;
module.exports = global.System = require("./server").System;
