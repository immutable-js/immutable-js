var LazyIterable = require('./LazyIterable');
var ArrayIterator = require('./ArrayIterator');
exports.ArrayIterator = ArrayIterator;
var ObjectIterator = require('./ObjectIterator');
exports.ObjectIterator = ObjectIterator;
var Map = require('./Map');
exports.Map = Map;
var Vector = require('./Vector');
exports.Vector = Vector;
var Set = require('./Set');
exports.Set = Set;

function isPersistent(value) {
    return value instanceof exports.Map || value instanceof exports.Vector || value instanceof exports.Set;
}
exports.isPersistent = isPersistent;

function isLazy(value) {
    return value instanceof LazyIterable;
}
exports.isLazy = isLazy;

function lazy(value) {
    if (exports.isLazy(value)) {
        return value;
    }
    if (Array.isArray(value)) {
        return new exports.ArrayIterator(value);
    }
    if (typeof value === 'object') {
        return new exports.ObjectIterator(value);
    }
    return null;
}
exports.lazy = lazy;

function fromJS(json) {
    if (Array.isArray(json)) {
        var vect = exports.Vector.empty();
        json.forEach(function (v, k) {
            vect.set(k, exports.fromJS(v));
        });
        return vect;
    }
    if (typeof json === 'object') {
        var map = exports.Map.empty();
        for (var k in json) {
            if (json.hasOwnProperty(k)) {
                map.set(k, exports.fromJS(json[k]));
            }
        }
        return map;
    }
    return json;
}
exports.fromJS = fromJS;

function toJS(value) {
    if (value instanceof exports.Vector) {
        var array = value.map(exports.toJS).toArray();
        array.length = value.length;
        return array;
    }
    if (value instanceof exports.Map) {
        return value.map(exports.toJS).toObject();
    }
    if (value instanceof exports.Set) {
        return value.map(exports.toJS).toArray();
    }
    return value;
}
exports.toJS = toJS;
//# sourceMappingURL=Persistent.js.map
