var ArrayIterator = require('./ArrayIterator');
exports.ArrayIterator = ArrayIterator;
var ObjectIterator = require('./ObjectIterator');
exports.ObjectIterator = ObjectIterator;
var Map = require('./Map');
exports.Map = Map;
var Vector = require('./Vector');
exports.Vector = Vector;
var Stack = require('./Stack');
exports.Stack = Stack;
var Range = require('./Range');
exports.Range = Range;

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
    return value;
}
exports.toJS = toJS;
//# sourceMappingURL=Persist.js.map
