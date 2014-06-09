if (typeof Promise === 'undefined') {
    // patching the runtime if `Promise` is not present
    global.Promise = require('ypromise');
}
if (typeof System === 'undefined') {
    // patching the runtime if `System` is not present.
    require('./micro-loader.js');
}
