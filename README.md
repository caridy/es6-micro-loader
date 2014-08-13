es6-micro-loader
================

ES6 System Loader Polyfill

## Overview

This package implements a `System` polyfill that works on a browser, and in nodejs. The reason why we call this a micro loader is because it sides with the developers, implementing only a very tiny part of the specs to maintain the semantic of the ES modules.

If you're looking for a full implementation of the ES6 Loader specs, you should check [SystemJS][] instead. Modules transpiled into `System.register()` using [es6-module-transpiler-system-formatter][] or [traceur-compiler][] should work fine with both implementations.

The browser version of the loader is meant to be used to call `System.import('module-name')` to access ES6 modules included in the page after loading the transpiled modules using script tags. While, the nodejs version, is meant to be used by calling `System.import('path/to/module-name')`.

## Disclaimer

This format is experimental, and it is a living creature, we will continue to tweak it until we fill it is good enough, and then we will change it again :p

## Usage

### In a browser

The browser polyfill for `System` is available in this package in `dist/system-polyfill.js` and the corresponding minified version of it. This polyfill has to be included in the page before calling `System.import()` and before loading any transpiled module.

_note: it provides basic network fetching mechanism to fetch modules using `script` tags by relying on `System.baseURL` configuration, which defaults to `/`, to construct the url to fetch the transpiled script in a non-blocking fashion. recommendation is to have all modules available locally somehow, right after including the polyfill in the page and not rely on the basic fetching routine that this polyfill provides.

_note: you might also need to load a Promise polyfill. we recommend to use `es6-promise` or `bluebird`._

Once `System` is available in a page, you can load the transpiled modules, where no order is required. E.g.:

```html
<script src="path/to/dist/system-polyfill.min.js"></script>
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

Install the npm package to access the `System` polyfill:

```
npm install es6-micro-loader --save
```

This package exports the `System` polyfill, so you can invoke `System.import()`, `System.get()` or `System.has()`:

```javascript
var System = require('es6-micro-loader');
System.import("global/path/to/module");
```

_note: the difference between a relative path, which is used when using `require()` in nodejs, and the global path to the module, which is what `System.import()` is expecting, is important. what is the "global/path/to/module" in the previous example? it is effectible the path from the root of the application (aka `process.env.PWD`) to the file in question. If you build a file into `build/foo.js`, then you use `build/foo` from any script in your application, independently of the `__dirname` or `__filename` from where you want to import `foo`._


# Benchmark

For the server side, you could do the same by transpiling the modules into CommonJS using [es6-module-transpiler][] and using `require('./path/to/module-name')`, and even try to use them thru [browserify], although, `System.register()` form provides order of magnituds better performance than CommonJS  output, due to the nature of the live bindings in ES6 Modules. You can run benchmark tests in this project:

```bash
git clone https://github.com/caridy/es6-micro-loader.git
cd es6-micro-loader
npm install
npm run benchmark
```

Benchmark results on the latest version:

```bash
cjs x 2,847,803 ops/sec ±0.90% (92 runs sampled)
system x 39,078,259 ops/sec ±0.78% (94 runs sampled)
bundle x 50,916,706 ops/sec ±1.21% (82 runs sampled)
Fastest is bundle
```

You can look into the benchmark code here: https://github.com/caridy/es6-micro-loader/tree/master/tests/benchmark

[es6-module-transpiler-system-formatter]: https://github.com/caridy/es6-module-transpiler-system-formatter
[SystemJS]: https://github.com/systemjs/systemjs
[es6-module-transpiler]: https://github.com/square/es6-module-transpiler
[traceur-compiler]: https://github.com/google/traceur-compiler
[browserify]: http://browserify.org/


## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

Thanks, and enjoy living in the ES6 future!
