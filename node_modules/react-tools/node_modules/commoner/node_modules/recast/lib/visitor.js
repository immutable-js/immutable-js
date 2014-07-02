var assert = require("assert");
var Class = require("cls");
var Node = require("./types").namedTypes.Node;
var slice = Array.prototype.slice;
var removeRequests = [];

var Visitor = exports.Visitor = Class.extend({
    visit: function(node) {
        var self = this;

        if (!node) {
            // pass

        } else if (node instanceof Array) {
            node = self.visitArray(node);

        } else if (Node.check(node)) {
            var methodName = "visit" + node.type,
                method = self[methodName] || self.genericVisit;
            node = method.call(this, node);

        } else if (typeof node === "object") {
            // Some AST node types contain ad-hoc (non-AST) objects that
            // may contain nested AST nodes.
            self.genericVisit(node);
        }

        return node;
    },

    visitArray: function(arr, noUpdate) {
        for (var elem, result, undef,
                 i = 0, len = arr.length;
             i < len;
             i += 1)
        {
            if (i in arr)
                elem = arr[i];
            else
                continue;

            var requesters = [];
            removeRequests.push(requesters);

            // Make sure we don't accidentally reuse a previous result
            // when this.visit throws an exception.
            result = undef;

            try {
                result = this.visit(elem);

            } finally {
                assert.strictEqual(
                    removeRequests.pop(),
                    requesters);
            }

            if (requesters.length > 0 || result === null) {
                // This hole will be elided by the compaction loop below.
                delete arr[i];
            } else if (result !== undef) {
                arr[i] = result;
            }
        }

        // Compact the array to eliminate holes.
        for (var dst = 0,
                 src = dst,
                 // The length of the array might have changed during the
                 // iteration performed above.
                 len = arr.length;
             src < len;
             src += 1)
            if (src in arr)
                arr[dst++] = arr[src];
        arr.length = dst;

        return arr;
    },

    remove: function() {
        var len = removeRequests.length,
            requesters = removeRequests[len - 1];
        if (requesters)
            requesters.push(this);
    },

    genericVisit: function(node) {
        var field,
            oldValue,
            newValue;

        for (field in node) {
            if (!node.hasOwnProperty(field))
                continue;

            oldValue = node[field];

            if (oldValue instanceof Array) {
                this.visitArray(oldValue);

            } else if (Node.check(oldValue)) {
                newValue = this.visit(oldValue);

                if (typeof newValue === "undefined") {
                    // Keep oldValue.
                } else {
                    node[field] = newValue;
                }

            } else if (typeof oldValue === "object") {
                this.genericVisit(oldValue);
            }
        }

        return node;
    }
});
