/* jslint node: true */

var path = require('path');

var seen = Object.create(null);
var internalRegistry = Object.create(null);
var externalRegistry = Object.create(null);

function ensuredExecute (name) {
   var mod = internalRegistry[name];
   if (mod && !seen[name]) {
     seen[name] = true;
     // one time operation to execute the module body
     mod.execute();
   }
   return mod && mod.proxy;
}
function set (name, values) {
  externalRegistry[name] = values;
}
function get (name) {
  return externalRegistry[name] || ensuredExecute(name);
}
function has (name) {
  return !!externalRegistry[name] || !!internalRegistry[name];
}



// exporting the System object
exports.System = {
  set: set,
  get: get,
  has: has,
  import: function(name) {
    return new Promise(function (resolve, reject) {
      var mod = patchedRequire(path.resolve(name));
      return mod ? resolve(mod) : reject(new Error('Could not find module ' + name));
    });
  },
  register: function(name, deps, wrapper) {
    var mod,
      externalDeps = [];
    // creating a new module entry that will be added to the cache later on
    mod = {
      name: name,
      setters: null,
      proxy: Object.create(null),
      deps: deps.map(function(dep) {
        if (dep.charAt(0) !== '.') {
          externalDeps.push(dep);
          return dep;
        }
        var parts = dep.split('/'),
          parentBase = name.split('/').slice(0, -1);
        while (parts[0] === '.' || parts[0] === '..') {
          if (parts.shift() === '..') {
            parentBase.pop();
          }
        }
        return parentBase.concat(parts).join('/');
      }),
      externalDeps: externalDeps,
      // other modules that depends on this so we can push updates into those modules
      dependants: [],
      // method used to push updates of dependencies into the module body
      update: function(moduleName, moduleObj) {
        mod.setters[mod.deps.indexOf(moduleName)](moduleObj);
      },
      execute: wrapper
    };
    newEntry = mod;
  }
};



var newEntry;
var m = require('module');
var Module = require('module').Module;
var originalLoader = require('module')._load;

// monkey patching `require()` during a brief period of time
function patchedRequire(name) {
  m._load = function patchedLoader(request, parent, isMain) {
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
          esModule.lock = true; // locking down the updates on the module to avoid infinite loop
          esModule.dependants.forEach(function(dependant) {
            if (!dependant.lock) {
              dependant.update(esModule.name, values);
            }
          });
          esModule.lock = false;
          if (!Object.getOwnPropertyDescriptor(esModule.proxy, identifier)) {
            Object.defineProperty(esModule.proxy, identifier, {
              enumerable: true,
              get: function() {
                return values[identifier];
              }
            });
          }
          return value;
        });
        esModule.setters = metaModule.setters;
        esModule.deps.forEach(function(dep) {
          var imports = externalRegistry[dep],
            depRequest, depFilename, depModule;
          if (!imports) {
            if (~esModule.externalDeps.indexOf(dep)) {
              imports = require(Module._resolveFilename(dep, cachedModule));
            } else {
              depRequest = path.resolve(path.join(esModule.basePath, dep));
              imports = require(depRequest);
              depFilename = Module._resolveFilename(depRequest, cachedModule);
              depModule = Module._cache[depFilename]._esModule;
              if (depModule) {
                depModule.dependants.push(esModule);
              }
            }
          }
          esModule.update(dep, imports);
        });
        // executing the module body
        metaModule.execute();
      }
    }
    return values;
  };
  var mod = require(name);
  // removing the patch
  m._load = originalLoader;
  return mod;
}
