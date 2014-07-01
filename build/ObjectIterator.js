var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var LazyIterable = require('./LazyIterable');

var ObjectIterator = (function (_super) {
    __extends(ObjectIterator, _super);
    function ObjectIterator(_object) {
        _super.call(this);
        this._object = _object;
    }
    ObjectIterator.prototype.iterate = function (fn, thisArg) {
        for (var key in this._object) {
            if (this._object.hasOwnProperty(key)) {
                if (fn.call(thisArg, this._object[key], key, this) === false) {
                    return false;
                }
            }
        }
        return true;
    };
    return ObjectIterator;
})(LazyIterable);

module.exports = ObjectIterator;
//# sourceMappingURL=ObjectIterator.js.map
