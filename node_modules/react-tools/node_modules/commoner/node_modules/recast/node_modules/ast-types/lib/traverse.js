var assert = require("assert");
var types = require("./types");
var Node = types.namedTypes.Node;
var isObject = types.builtInTypes.object;
var isArray = types.builtInTypes.array;
var NodePath = require("./node-path");
var funToStr = Function.prototype.toString;
var thisPattern = /\bthis\b/;

// Good for traversals that need to modify the syntax tree or to access
// path/scope information via `this` (a NodePath object). Somewhat slower
// than traverseWithNoPathInfo because of the NodePath bookkeeping.
function traverseWithFullPathInfo(node, callback) {
    if (!thisPattern.test(funToStr.call(callback))) {
        // If the callback function contains no references to `this`, then
        // it will have no way of using any of the NodePath information
        // that traverseWithFullPathInfo provides, so we can skip that
        // bookkeeping altogether.
        return traverseWithNoPathInfo(
            node instanceof NodePath ? node.value : node,
            callback
        );
    }

    function traverse(path) {
        assert.ok(path instanceof NodePath);
        var value = path.value;

        if (isArray.check(value)) {
            path.each(traverse);
            return;
        }

        if (Node.check(value)) {
            if (callback.call(path, value, traverse) === false) {
                return;
            }
        } else if (!isObject.check(value)) {
            return;
        }

        types.eachField(value, function(name, child) {
            var childPath = path.get(name);
            if (childPath.value !== child) {
                childPath.replace(child);
            }

            traverse(childPath);
        });
    }

    if (node instanceof NodePath) {
        traverse(node);
        return node.value;
    }

    // Just in case we call this.replace at the root, there needs to be an
    // additional parent Path to update.
    var rootPath = new NodePath({ root: node });
    traverse(rootPath.get("root"));
    return rootPath.value.root;
}

// Good for read-only traversals that do not require any NodePath
// information. Faster than traverseWithFullPathInfo because less
// information is exposed. A context parameter is supported because `this`
// no longer has to be a NodePath object.
function traverseWithNoPathInfo(node, callback, context) {
    Node.assert(node);
    context = context || null;

    function traverse(node) {
        if (isArray.check(node)) {
            node.forEach(traverse);
            return;
        }

        if (Node.check(node)) {
            if (callback.call(context, node, traverse) === false) {
                return;
            }
        } else if (!isObject.check(node)) {
            return;
        }

        types.eachField(node, function(name, child) {
            traverse(child);
        });
    }

    traverse(node);

    return node;
}

// Since we export traverseWithFullPathInfo as module.exports, we need to
// attach traverseWithNoPathInfo to it as a property. In other words, you
// should use require("ast-types").traverse.fast(ast, ...) to invoke the
// quick-and-dirty traverseWithNoPathInfo function.
traverseWithFullPathInfo.fast = traverseWithNoPathInfo;

module.exports = traverseWithFullPathInfo;
