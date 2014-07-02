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
    ArrayIterator.prototype.iterate = function (fn, thisArg, reverseIndices) {
        var array = this._array;
        return this._array.every(function (value, index) {
            return fn.call(thisArg, value, reverseIndices ? array.length - 1 - index : index, array) !== false;
        });
    };

    ArrayIterator.prototype.reverseIterate = function (fn, thisArg, maintainIndices) {
        var array = this._array;
        for (var ii = array.length - 1; ii >= 0; ii--) {
            if (array.hasOwnProperty(ii) && fn.call(thisArg, array[ii], maintainIndices ? ii : array.length - 1 - ii, array) === false) {
                return false;
            }
        }
        return true;
    };
    return ArrayIterator;
})(OrderedLazyIterable);

module.exports = ArrayIterator;
//# sourceMappingURL=ArrayIterator.js.map
