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

### In a browser

Install the npm package, and include `node_modules/es6-micro-loader/src/window-system.js` at the top of your pages, whether it's inline or by reference, or by a build process, that's entirely your choice.

Once `System` is available in a page, you can load the transpiled modules, where no order is required. E.g.:

```html
<script src="path/to/window-loader.js"></script>
<script src="path/to/named/foo.js"></script>
<script src="path/to/named/bar.js"></script>
<script src="path/to/named/baz.js"></script>
```

then you can simply use the imperative form to import any of the available modules, e.g:

```javascript
System.has('named/foo'); // -> true
System.has('named/wrong'); // -> false
System.import('named/foo').then(function (foo) {
  foo.init(); // do something
}).catch(function (err) {
  console.log(err);
});
```

### In nodejs

Install the npm package that extends nodejs to support `System`.

```
npm install es6-micro-loader --save
```

Require the microloader whenever you plan to invoke `System.import()`, `System.get()` or `System.has()`:

```javascript
var System = require('es6-micro-loader');
System.import("global/path/to/module");
```

The small detail here is the difference between a relative path, which is the one used when invoking `require()` in nodejs, and the global path to the module, which is what `System.import()` is expecting. So, what is the "global/path/to/module" then? it is effectible a relative path from the root of the application (aka `process.env.PWD`) to the file in question. If you build a file into `build/foo.js`, then you use `build/foo` from any script in your application, independently of the `__dirname` of the file from where you want to import `foo`.

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

Thanks, and enjoy living in the ES6 future!
