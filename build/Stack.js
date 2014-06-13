var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var OrderedIterable = require('./OrderedIterable');

/**
* A Stack allows us to push and pop to the first position in the list as well as walk this list.
*/
var Stack = (function (_super) {
    __extends(Stack, _super);
    // @pragma Construction
    function Stack() {
        var values = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            values[_i] = arguments[_i + 0];
        }
        return Stack.fromArray(values);
        _super.call(this);
    }
    Stack.empty = function () {
        if (!__EMPTY_QUEUE) {
            __EMPTY_QUEUE = Stack._make(undefined, undefined);
            __EMPTY_QUEUE.length = 0;
        }
        return __EMPTY_QUEUE;
    };

    Stack.fromArray = function (values) {
        var list = Stack.empty();
        for (var ii = values.length - 1; ii >= 0; ii--) {
            list = list.push(values[ii]);
        }
        return list;
    };

    Stack.prototype.get = function (index) {
        var queue = this;
        while (index-- > 0) {
            queue = queue.pop();
        }
        return queue._value;
    };

    Stack.prototype.first = function () {
        return this._value;
    };

    Stack.prototype.last = function () {
        return this.get(this.length - 1);
    };

    // @pragma Modification
    Stack.prototype.push = function (value) {
        return Stack._make(value, this.length === 0 ? undefined : this);
    };

    Stack.prototype.pop = function () {
        return this._next ? this._next : Stack.empty();
    };

    // @pragma Iteration
    Stack.prototype.iterate = function (fn, thisArg) {
        var queue = this;
        var iterations = 0;
        while (queue && queue.length) {
            if (fn.call(thisArg, queue._value, iterations++, this) === false) {
                return false;
            }
            queue = queue._next;
        }
        return true;
    };

    Stack._make = function (value, next) {
        var queue = Object.create(Stack.prototype);
        queue._value = value;
        queue._next = next;
        queue.length = next ? next.length + 1 : 1;
        return queue;
    };
    return Stack;
})(OrderedIterable);

var __EMPTY_QUEUE;

module.exports = Stack;
//# sourceMappingURL=Stack.js.map
