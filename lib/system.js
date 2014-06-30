/* jslint node:true */
"use strict";

var Promise = global.Promise || require("es6-promise").Promise;
var m = require("module");
var Module = m.Module;
var originalLoader = m._load;
var registry = Object.create(null);
var seen = Object.create(null);
var path = require("path");
var newEntry;

function get(name) {
  var mod = registry[name];
  if (mod && !seen[name]) {
    seen[name] = true;
    // one time operation to execute the module body
    mod.execute();
  }
  return mod && mod.proxy;
}
function register(name, deps, wrapper) {
  var mod;
  // creating a new module entry that will be added to the cache later on
  newEntry = mod = {
    name: name,
    setters: null,
    proxy: Object.create(null),
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
      mod.setters[mod.deps.indexOf(moduleName)](moduleObj);
    },
    execute: wrapper
  };
}

m._load = function hookedLoader(request, parent, isMain) {
  var values, filename, cachedModule, metaModule, esModule;
  newEntry = undefined;
  values = originalLoader.apply(this, arguments);
  if (newEntry) {
    filename = Module._resolveFilename(request, parent);
    cachedModule = Module._cache[filename];
    if (cachedModule && !cachedModule._esModule) {
      cachedModule._esModule = esModule = newEntry;
      esModule.address = filename;
      esModule.basePath = request.slice(0, -esModule.name.length);
      esModule.parent = parent;
      // collecting execute() and setters[]
      metaModule = esModule.execute(function(identifier, value) {
        values[identifier] = value;
        esModule.dependants.forEach(function(dependant) {
          dependant.update(esModule.name, values);
        });
        if (!Object.getOwnPropertyDescriptor(esModule.proxy, identifier)) {
          Object.defineProperty(esModule.proxy, identifier, {
            enumerable: true,
            get: function() {
              return values[identifier];
            }
          });
        }
      });
      esModule.setters = metaModule.setters;
      // requiring the dependencies
      esModule.deps.forEach(function(dep) {
        var depRequest = path.resolve(path.join(esModule.basePath, dep)),
          imports = require(depRequest),
          depFilename = Module._resolveFilename(depRequest, parent),
          depModule = Module._cache[depFilename]._esModule;
        if (depModule) {
          depModule.dependants.push(esModule);
          esModule.update(dep, imports);
        }
      });
      // executing the module body
      metaModule.execute();
    }
  }
  return values;
};

module.exports = {
  get: get,
  register: register,
  has: function (name) {
    return !!registry[name];
  },
  import: function(name) {
    return new Promise(function (resolve, reject) {
      var mod = require(path.resolve(name));
      return mod ? resolve(mod) : reject(new Error("Could not find module " + name));
    });
  }
};
