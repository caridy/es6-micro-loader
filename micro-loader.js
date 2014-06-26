"use strict";

var registry = Object.create(null),
  seen = Object.create(null);

global.System = {
  normalizeName: function(child, parentBase) {
    if (child.charAt(0) !== '.') {
      return child;
    }
    var parts = child.split("/");
    while (parts[0] === '.' || parts[0] === '..') {
      if (parts.shift() === '..') {
        parentBase.pop();
      }
    }
    return parentBase.concat(parts).join("/");
  },
  get: function(name) {
    var mod = registry[name];
    if (mod && !seen[name]) {
      seen[name] = true;
      // one time operation to execute the module body
      mod.execute();
    }
    return mod && mod.proxy;
  },
  register: function(name, deps, wrapper) {
    var proxy = Object.create(null),
      values = Object.create(null),
      module,
      meta;

    registry[name] = module = {
      // live bindings
      proxy: proxy,
      // exported values
      values: values,
      // normalizing deps
      dependencies: deps.map(function(dep) {
        return System.normalizeName(dep, name.split("/").slice(0, -1));
      }),
      // other modules that depends on this so we can push updates into those modules
      dependants: [],
      // method used to push updates of dependencies into the module body
      push: function(moduleName, moduleObj, identifier) {
        meta.setters[module.dependencies.indexOf(moduleName)](moduleObj, identifier);
      },
      execute: function () {
        module.dependencies.map(function(dependency) {
          var values = System.get(dependency);
          if (registry[dependency]) {
            registry[dependency].dependants.push(name);
            // optimization, since it is a controlled setter from transpiler, we can pass
            // the plain values instead of the bindings
            values = registry[dependency].values;
          }
          module.push(dependency, values);
        });
        meta.execute();
      }
    };

    // collecting execute() and setters[]
    meta = wrapper(function(identifier, value) {
      values[identifier] = value;
      module.dependants.forEach(function(moduleName) {
        if (registry[moduleName]) {
          registry[moduleName].push(name, values, identifier);
        }
      });
      if (!Object.getOwnPropertyDescriptor(proxy, identifier)) {
        Object.defineProperty(proxy, identifier, {
          enumerable: true,
          get: function() {
            return values[identifier];
          }
        });
      }
    });
  },
  import: function(name) {
    var mod;
    try {
      mod = System.get(System.normalizeName(name, []));
      return mod ? Promise.resolve(mod) : Promise.reject(new Error("Could not find module " + name));
    } catch (e) {
      return Promise.reject(e);
    }
  }
};
