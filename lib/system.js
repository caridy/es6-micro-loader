/* jslint node:true */
"use strict";

var Promise = global.Promise || require("ypromise");
var m = require("module");
var originalLoader = m._load;
var registry = Object.create(null);
var seen = Object.create(null);
var path = require("path");
var justRegistered;
var System = {
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
    var proxy = Object.create(null), values = Object.create(null), mod, meta;
    justRegistered = name;
    // creating a new entry in the internal registry
    registry[name] = mod = {
      name: name,
      parent: null,
      // live bindings
      proxy: proxy,
      // exported values
      values: values,
      // normalized deps
      deps: deps.map(function(dep) {
        if (dep.charAt(0) !== ".") {
          return dep;
        }
        var parts = dep.split("/"),
          parentBase = name.split("/").slice(0, -1);
        while (parts[0] === "." || parts[0] === "..") {
          if (parts.shift() === "..") {
            parentBase.pop();
          }
        }
        return parentBase.concat(parts).join("/");
      }),
      // other modules that depends on this so we can push updates into those modules
      dependants: [],
      // method used to push updates of dependencies into the module body
      update: function(moduleName, moduleObj) {
        meta.setters[mod.deps.indexOf(moduleName)](moduleObj);
      },
      execute: function () {
        mod.deps.forEach(function(dep) {
          var imports = System.get(dep) || require(m.Module._resolveFilename(mod.basePath + dep, mod.parent));
          if (registry[dep]) {
            registry[dep].dependants.push(name);
            // optimization to push plain values instead of the bindings
            imports = registry[dep].values;
          }
          if (imports) {
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
    });
  },
  import: function(name) {
    return new Promise(function (resolve, reject) {
      var mod = require(path.resolve(name));
      return mod ? resolve(mod) : reject(new Error("Could not find module " + name));
    });
  }
};

m._load = function hookedLoader(request, parent, isMain) {
  var exports, i, mod, values;
  justRegistered = undefined;
  exports = originalLoader.apply(this, arguments);
  if (justRegistered) {
    // extending exports with the ES exports
    mod = registry[justRegistered];
    mod.basePath = request.slice(0, -justRegistered.length);
    mod.parent = parent;
    values = System.get(justRegistered) && mod.values;
    for (i in values) {
      Object.defineProperty(exports, i, {
        enumerable: true,
        get: function() {
          return values[i];
        }
      });
    }
    mod.proxy = exports; // unifying the nodejs exports and the proxy object for the ES module
  }
  return exports;
};

module.exports = System;
