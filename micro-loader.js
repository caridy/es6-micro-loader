"use strict";

var registry = Object.create(null), seen = Object.create(null);

global.System = {
    normalizeName: function (child, parentBase) {
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
    get: function (name) {
        var mod = registry[name];
        if (mod && !seen[name]) {
            seen[name] = true;
            // one time operation to execute the module body
            mod.fn.apply(mod/* todo: which context to use*/, mod.deps.map(function (dep) {
                return System.get(dep);
            }));
        }
        return mod && mod.proxy;
    },
    register: function (name, wrapper) {
        var proxy = Object.create(null),
            module = wrapper(),
            parentBase;
        // one time operation to normalize deps
        // this might get done by the build process, in that case we opt out
        if (!module.normalized) {
            parentBase = name.split("/").slice(0, -1)
            module.deps = module.deps.map(function (dep) {
                return System.normalizeName(dep, parentBase);
            });
        }
        registry[name] = module;
        registry[name].proxy = proxy;
        module.bindings.forEach(function (id) {
            Object.defineProperty(proxy, id, {
                enumerable: true,
                get: function() {
                    return module.exports[id];
                }
            });
        });
    },
    import: function (name) {
        var mod;
        try {
            mod = System.get(System.normalizeName(name, []));
            return mod ? Promise.resolve(mod) : Promise.reject(new Error("Could not find module " + name));
        } catch (e) {
            return Promise.reject(e);
        }
    }
};
