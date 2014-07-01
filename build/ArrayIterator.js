var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var OrderedLazyIterable = require('./OrderedLazyIterable');

var ArrayIterator = (function (_super) {
    __extends(ArrayIterator, _super);
    function ArrayIterator(_array) {
        _super.call(this);
        this._array = _array;
    }
    ArrayIterator.prototype.iterate = function (fn, thisArg) {
        var iterator = this._array;
        return this._array.every(function (value, index) {
            return fn.call(thisArg, value, index, iterator) !== false;
        });
    };

    ArrayIterator.prototype.reverseIterate = function (fn, thisArg) {
        for (var ii = this._array.length - 1; ii >= 0; ii--) {
            if (this._array.hasOwnProperty(ii) && fn.call(thisArg, this._array[ii], ii, this._array) === false) {
                return false;
            }
        }
        return true;
    };
    return ArrayIterator;
})(OrderedLazyIterable);

module.exports = ArrayIterator;
//# sourceMappingURL=ArrayIterator.js.map
