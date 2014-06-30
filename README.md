es6-micro-loader
================

ES6 System Loader Polyfill

## Overview

This package implements two versions of the `System` polyfill, one for the browser, and another for nodejs. The reason why we call this a micro loader is because it sides with the developers, implementing only a very tiny part of the specs to maintain the semantic of the ES modules. It does NOT provide any feature related to the network activity, or loading infrastructure, it assumes all modules are loaded somehow, right after including the polyfill in the page, or requiring it on nodejs.

If you're looking for a full implementation of the ES6 Loader specs, you should check [SystemJS][] instead. Modules transpiled into `System.register()` using [es6-module-transpiler-system-formatter][] or [traceur-compiler][] should work fine with both implementations.

The browser version of the loader is meant to be used to call `System.import()` to access ES6 modules included in the page after transpiling them into `System.register('module-name')` form.

While the nodejs version of the loader is meant to be used to load ES6 modules by calling `System.import('path/to/module-name')` after transpiling the modules into `System.register()` form. You could do the same by transpiling the modules into CommonJS using [es6-module-transpiler][] and using `require('path/to/module')`, although, if you plan to re-use those modules on the client side as well, compiling into two different formats is not ideal. We also plan to provide better performance than what you can get when using CommonJS as the output, due to the nature of the live bindings for ES6 Modules.

[es6-module-transpiler-system-formatter]: https://github.com/caridy/es6-module-transpiler-system-formatter
[SystemJS]: https://github.com/systemjs/systemjs
[es6-module-transpiler]: https://github.com/square/es6-module-transpiler
[traceur-compiler]: https://github.com/google/traceur-compiler

## Disclaimer

This format is experimental, and it is a living creature, we will continue to tweak it until we fill it is good enough, and then we will change it again :p

## Usage

TBD

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

Thanks, and enjoy living in the ES6 future!
