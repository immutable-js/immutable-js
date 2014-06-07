var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var OrderedIterable = require('./OrderedIterable');


var PQueue = (function (_super) {
    __extends(PQueue, _super);
    // @pragma Construction
    function PQueue() {
        var values = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            values[_i] = arguments[_i + 0];
        }
        _super.call(this, this);
        return PQueue.fromArray(values);
    }
    PQueue.empty = function () {
        if (!__EMPTY_QUEUE) {
            __EMPTY_QUEUE = PQueue._make(undefined, undefined);
            __EMPTY_QUEUE.length = 0;
        }
        return __EMPTY_QUEUE;
    };

    PQueue.fromArray = function (values) {
        var list = PQueue.empty();
        for (var ii = values.length - 1; ii >= 0; ii--) {
            list = list.push(values[ii]);
        }
        return list;
    };

    PQueue.prototype.first = function () {
        return this._value;
    };

    // @pragma Modification
    PQueue.prototype.push = function (value) {
        return PQueue._make(value, this.length === 0 ? undefined : this);
    };

    PQueue.prototype.pop = function () {
        return this._next ? this._next : PQueue.empty();
    };

    // @pragma Iteration
    PQueue.prototype.iterate = function (fn, thisArg) {
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

    PQueue._make = function (value, next) {
        var queue = Object.create(PQueue.prototype);
        queue.collection = queue;
        queue._value = value;
        queue._next = next;
        queue.length = next ? next.length + 1 : 1;
        return queue;
    };
    return PQueue;
})(OrderedIterable);
exports.PQueue = PQueue;

var __EMPTY_QUEUE;
