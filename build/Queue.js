var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var OrderedIterable = require('./OrderedIterable');

/**
* A Queue allows us to push and pop to the first position in the list as well as walk this list.
*/
var Queue = (function (_super) {
    __extends(Queue, _super);
    // @pragma Construction
    function Queue() {
        var values = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            values[_i] = arguments[_i + 0];
        }
        _super.call(this, this);
        return Queue.fromArray(values);
    }
    Queue.empty = function () {
        if (!__EMPTY_QUEUE) {
            __EMPTY_QUEUE = Queue._make(undefined, undefined);
            __EMPTY_QUEUE.length = 0;
        }
        return __EMPTY_QUEUE;
    };

    Queue.fromArray = function (values) {
        var list = Queue.empty();
        for (var ii = values.length - 1; ii >= 0; ii--) {
            list = list.push(values[ii]);
        }
        return list;
    };

    Queue.prototype.first = function () {
        return this._value;
    };

    // @pragma Modification
    Queue.prototype.push = function (value) {
        return Queue._make(value, this.length === 0 ? undefined : this);
    };

    Queue.prototype.pop = function () {
        return this._next ? this._next : Queue.empty();
    };

    // @pragma Iteration
    Queue.prototype.iterate = function (fn, thisArg) {
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

    Queue._make = function (value, next) {
        var queue = Object.create(Queue.prototype);
        queue.collection = queue;
        queue._value = value;
        queue._next = next;
        queue.length = next ? next.length + 1 : 1;
        return queue;
    };
    return Queue;
})(OrderedIterable);
exports.Queue = Queue;

var __EMPTY_QUEUE;
//# sourceMappingURL=Queue.js.map
