/* global window, Promise */
window.System = (function () {
  "use strict";

  var registry = Object.create(null),
    seen = Object.create(null);

  function normalizeName(child, parentBase) {
    if (child.charAt(0) !== ".") {
      return child;
    }
    var parts = child.split("/");
    while (parts[0] === "." || parts[0] === "..") {
      if (parts.shift() === "..") {
        parentBase.pop();
      }
    }
    return parentBase.concat(parts).join("/");
  }
  function get (name) {
    var mod = registry[name];
    if (mod && !seen[name]) {
      seen[name] = true;
      // one time operation to execute the module body
      mod.execute();
    }
    return mod && mod.proxy;
  }
  function register (name, deps, wrapper) {
    var proxy = Object.create(null), values = Object.create(null), mod, meta;
    // creating a new entry in the internal registry
    registry[name] = mod = {
      // live bindings
      proxy: proxy,
      // exported values
      values: values,
      // normalized deps
      deps: deps.map(function(dep) {
        return normalizeName(dep, name.split("/").slice(0, -1));
      }),
      // other modules that depends on this so we can push updates into those modules
      dependants: [],
      // method used to push updates of deps into the module body
      update: function(moduleName, moduleObj) {
        meta.setters[mod.deps.indexOf(moduleName)](moduleObj);
      },
      execute: function () {
        mod.deps.map(function(dep) {
          // optimization to pass plain values instead of the bindings
          var imports = get(dep) && registry[dep].values;
          if (imports) {
            registry[dep].dependants.push(name);
            mod.update(dep, imports);
          }
        });
        meta.execute();
      }
    };
    // collecting execute() and setters[]
    meta = wrapper(function(identifier, value) {
      values[identifier] = value;
      mod.dependants.forEach(function(moduleName) {
        if (registry[moduleName]) {
          registry[moduleName].update(name, values);
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
      return value;
    });
  }

  return {
    get: get,
    register: register,
    has: function (name) {
      return !!registry[name];
    },
    import: function(name) {
      return new Promise(function (resolve, reject) {
        var mod = get(normalizeName(name, []));
        return mod ? resolve(mod) : reject(new Error("Could not find module " + name));
      });
    }
  };

})();
