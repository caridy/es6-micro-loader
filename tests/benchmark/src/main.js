/* jslint esnext: true */

import isOdd from "./odds";

export function checkForOdd(n) {
    return isOdd(n);
}

// this is needed for `bundle` output
if (typeof global !== 'undefined') {
  global.checkForOdd = checkForOdd;
}
