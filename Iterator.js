var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
function invariant(condition, error) {
    if (!condition)
        throw new Error(error);
}

var Iterator = (function () {
    function Iterator(collection) {
        this.collection = collection;
    }
    Iterator.prototype.iterate = function (fn, thisArg) {
        throw new Error('Abstract method');
    };

    Iterator.prototype.toArray = function () {
        var array = [];
        var numericKeys;
        this.iterate(function (v, k) {
            if (numericKeys == null) {
                numericKeys = typeof k === 'number';
            }
            if (numericKeys) {
                array[k] = v;
            } else {
                array.push(v);
            }
        });
        return array;
    };

    // TODO: toVector() and toMap()
    Iterator.prototype.forEach = function (fn, thisArg) {
        this.iterate(function (v, k, c) {
            fn.call(thisArg, v, k, c);
        });
    };

    Iterator.prototype.find = function (fn, thisArg) {
        var foundKey;
        this.iterate(function (v, k, c) {
            if (fn.call(thisArg, v, k, c) === true) {
                foundKey = k;
                return false;
            }
        });
        return foundKey;
    };

    Iterator.prototype.map = function (fn, thisArg) {
        return new MapIterator(this, fn, thisArg);
    };

    Iterator.prototype.filter = function (fn, thisArg) {
        return new FilterIterator(this, fn, thisArg);
    };
    return Iterator;
})();


var MapIterator = (function (_super) {
    __extends(MapIterator, _super);
    function MapIterator(iterator, mapper, mapThisArg) {
        _super.call(this, iterator.collection);
        this.iterator = iterator;
        this.mapper = mapper;
        this.mapThisArg = mapThisArg;
    }
    MapIterator.prototype.iterate = function (fn, thisArg) {
        var map = this.mapper;
        var mapThisArg = this.mapThisArg;
        return this.iterator.iterate(function (v, k, c) {
            fn.call(thisArg, map.call(mapThisArg, v, k, c), k, c);
        });
    };
    return MapIterator;
})(Iterator);

var FilterIterator = (function (_super) {
    __extends(FilterIterator, _super);
    function FilterIterator(iterator, predicate, predicateThisArg) {
        _super.call(this, iterator.collection);
        this.iterator = iterator;
        this.predicate = predicate;
        this.predicateThisArg = predicateThisArg;
    }
    FilterIterator.prototype.iterate = function (fn, thisArg) {
        var predicate = this.predicate;
        var predicateThisArg = this.predicateThisArg;
        var numericKeys;
        var iterations = 0;
        return this.iterator.iterate(function (v, k, c) {
            if (predicate.call(predicateThisArg, v, k, c)) {
                if (numericKeys == null) {
                    numericKeys = typeof k === 'number';
                }
                fn.call(thisArg, v, numericKeys ? iterations++ : k, c);
            }
        });
    };
    return FilterIterator;
})(Iterator);
module.exports = Iterator;
