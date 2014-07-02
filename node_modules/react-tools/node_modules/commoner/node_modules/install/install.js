(function(global, undefined) {
    // Defining the `install` function more than once leads to mayhem, so
    // return immedately if a property called `install` is already defined on
    // the global object.
    if (global.install)
        return;

    // The `installed` object maps absolute module identifiers to module
    // definitions available for requirement.
    var installed = {};

    // I make frequent use of `hasOwn.call` to test for the presence of object
    // properties without traversing the prototype chain.
    var hasOwn = installed.hasOwnProperty;

    // Anonymous modules are pushed onto a queue so that (when ready) they can
    // be executed in order of installation.
    var qhead = {};
    var qtail = qhead;

    // Define the `install` function globally.
    global.install = function(id, module) {
        // To install a named module, pass an absolute module identifier
        // string followed by a module definition. Note that named modules are
        // not evaluated until they are required for the first time.
        if (typeof id === "string" && module) {
            if (!hasOwn.call(installed, id)) {
                installed[module.id = id] = module;
                flushQueue();
            }
        // To install an anonymous module, pass a module definition without an
        // identifier. Anonymous modules are executed in order of
        // installation, as soon as their requirements have been installed.
        } else if (id && typeof id.call === "function") {
            qtail = qtail.next = { module: id };
            if (qhead.next === qtail)
                flushQueue();
        }
    };

    // The `require` function takes an absolute module identifier and returns
    // the `exports` object defined by that module. An error is thrown if no
    // module with the given identifier is installed.
    function require(moduleId) {
        if (hasOwn.call(installed, moduleId)) {
            var module = installed[moduleId];
            if (!hasOwn.call(module, "exports")) {
                // Each module receives a version of `require` that knows how
                // to `absolutize` relative module identifiers with respect to
                // `moduleId`.
                module.call(global, function(id) {
                    return require(absolutize(id, moduleId));
                }, module.exports = {}, module);
            }
            // Note that `module.exports` may be redefined during evaluation
            // of the module.
            return module.exports;
        }
        // Since modules are evaluated only after all their requirements have
        // been installed, this error generally means that `require` was
        // called with an identifier that was not seen (or was not understood)
        // by the dependency scanner.
        throw new Error('module "' + moduleId + '" not installed');
    }

    // Given two module identifiers `id` and `baseId`, the `absolutize`
    // function returns the absolute form of `id`, as if `id` were required
    // from a module with the identifier `baseId`. For more information about
    // relative identifiers, refer to the
    // [spec](http://wiki.commonjs.org/wiki/Modules/1.1#Module_Identifiers).
    var pathNormExp = /\/(\.?|[^\/]+\/\.\.)\//;
    function absolutize(id, baseId) {
        if (id.charAt(0) === ".") {
            // Note: if `baseId` is omitted, then `"/undefined/../" + id` will
            // be the starting point for normalization, which works just fine!
            id = "/" + baseId + "/../" + id;
            while (id != (baseId = id.replace(pathNormExp, "/")))
                id = baseId;
            id = id.replace(/^\//, "");
        }
        return id;
    }

    // The `flushQueue` function attempts to evaluate the oldest module in the
    // queue, provided all of its dependencies have been installed. This
    // provision is important because it ensures that the module can call
    // `require` without fear of missing dependencies.
    function flushQueue() {
        var next = qhead.next, module;
        if (next && !flushing && ready(module = next.module)) {
            flushing = qhead = next;
            // Module evaluation might throw an exception, so we need to
            // schedule the next call to `flushQueue` before invoking
            // `module.call`. The `setTimeout` function allows the stack to
            // unwind before flushing resumes, so that the browser has a chance
            // to report exceptions and/or handle other events.
            global.setTimeout(resume, 0);
            module.call(global, require);
            flushing = undefined;
        }
    }

    // If `install` is called during the evaluation of a queued module,
    // `flushQueue` could be invoked recursively. To prevent double evaluation,
    // `flushQueue` sets `flushing` to a truthy value before it evaluates a
    // module and refuses to evaluate any modules if `flushing` is truthy
    // already.
    var flushing;

    // Since `resume` is only ever invoked from `setTimeout`, there is no risk
    // that `flushQueue` is already executing, so it is safe to clear the
    // `flushing` flag unconditionally.
    function resume() {
        flushing = undefined;
        flushQueue();
    }

    // To be recognized as dependencies, calls to `require` must use string
    // literal identifiers.
    var requireExp = /\brequire\(['"]([^'"]+)['"]\)/g;

    // A module is `ready` to be evaluated if
    //
    //   1. it has an `.exports` property (indicating that it has already begun to be evaluated) or
    //   1. all of its direct dependencies are installed and `ready` to be evaluated.
    //
    // Note that the above definition is recursive.
    function ready(module) {
        var deps, code, match, id, result = true;

        if (!module.seen &&
            !hasOwn.call(module, "exports"))
        {
            // Here's a little secret: module definitions don't have to be
            // functions, as long as they have a suitable `.toString` and
            // `.call` methods. If you have a really long module that you
            // don't want to waste time scanning, just override its
            // `.toString` function to return something equivalent (with
            // regard to dependencies) but shorter.
            deps = module.deps;
            if (!deps) {
                code = module + "";
                deps = module.deps = {};
                requireExp.lastIndex = 0;
                while ((match = requireExp.exec(code)))
                    deps[absolutize(match[1], module.id)] = true;
            }

            // There may be cycles in the dependency graph, so we must be
            // careful that the recursion always terminates. Each module we
            // check is temporarily marked as `.seen` before its dependencies
            // are traversed, so that if we encounter the same module again we
            // can immediately return `true`.
            module.seen = true;

            for (id in deps) {
                if (hasOwn.call(deps, id)) {
                    // Once a dependency is determined to be satisfied, we
                    // remove its identifier from `module.deps`, so that we
                    // can avoid considering it again if `ready` is called
                    // multiple times.
                    if (hasOwn.call(installed, id) && ready(installed[id])) {
                        delete deps[id];
                    // If any dependency is missing or not `ready`, then the
                    // current module is not yet `ready`. The `break` is not
                    // strictly necessary here, but immediately terminating
                    // the loop postpones work that can be done later.
                    } else {
                        result = false;
                        break;
                    }
                }
            }

            // Ordinarily I would be more paranoid about always resetting
            // `module.seen` to `false`, but if you thoroughly examine the code
            // above, you'll find that the only real threat of exceptions comes
            // from evaluating `code = module + ""` in a recursive call to
            // `ready`. So if you decide to override the `.toString` method of a
            // module for performance reasons, get it right.
            module.seen = false;
        }

        return result;
    }

// The most reliable way to get the global object:
// [http://stackoverflow.com/a/3277192/128454](http://stackoverflow.com/a/3277192/128454)
}(Function("return this")()));
