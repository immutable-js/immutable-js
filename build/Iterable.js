var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Iterable = (function () {
    function Iterable() {
    }
    Iterable.prototype.iterate = function (fn, thisArg) {
        throw new Error('Abstract method');
    };

    Iterable.prototype.toArray = function () {
        var array = [];
        this.iterate(function (v) {
            array.push(v);
        });
        return array;
    };

    Iterable.prototype.toObject = function () {
        var object = {};
        this.iterate(function (v, k) {
            object[k] = v;
        });
        return object;
    };

    Iterable.prototype.toVector = function () {
        // Use Late Binding here to solve the circular dependency.
        var vect = require('./Vector').empty().asTransient();
        this.iterate(function (v) {
            vect.push(v);
        });
        return vect.asPersistent();
    };

    Iterable.prototype.toMap = function () {
        // Use Late Binding here to solve the circular dependency.
        return require('./Map').empty().merge(this);
    };

    Iterable.prototype.keys = function () {
        return this.map(function (v, k) {
            return k;
        });
    };

    Iterable.prototype.forEach = function (fn, thisArg) {
        this.iterate(function (v, k, c) {
            fn.call(thisArg, v, k, c);
        });
    };

    Iterable.prototype.find = function (fn, thisArg) {
        var foundKey;
        this.iterate(function (v, k, c) {
            if (fn.call(thisArg, v, k, c) === true) {
                foundKey = k;
                return false;
            }
        });
        return foundKey;
    };

    Iterable.prototype.reduce = function (fn, initialReduction, thisArg) {
        var reduction = initialReduction;
        this.iterate(function (v, k, c) {
            reduction = fn.call(thisArg, reduction, v, k, c);
        });
        return reduction;
    };

    Iterable.prototype.map = function (fn, thisArg) {
        return new MapIterator(this, fn, thisArg);
    };

    Iterable.prototype.filter = function (fn, thisArg) {
        return new FilterIterator(this, fn, thisArg);
    };

    Iterable.prototype.every = function (fn, thisArg) {
        var every = true;
        this.iterate(function (v, k, c) {
            if (!fn.call(thisArg, v, k, c)) {
                every = false;
                return false;
            }
        });
        return every;
    };

    Iterable.prototype.some = function (fn, thisArg) {
        var some = false;
        this.iterate(function (v, k, c) {
            if (fn.call(thisArg, v, k, c)) {
                some = true;
                return false;
            }
        });
        return some;
    };
    return Iterable;
})();

var MapIterator = (function (_super) {
    __extends(MapIterator, _super);
    function MapIterator(iterator, mapper, mapThisArg) {
        _super.call(this);
        this.iterator = iterator;
        this.mapper = mapper;
        this.mapThisArg = mapThisArg;
    }
    MapIterator.prototype.iterate = function (fn, thisArg) {
        var map = this.mapper;
        var mapThisArg = this.mapThisArg;
        return this.iterator.iterate(function (v, k, c) {
            if (fn.call(thisArg, map.call(mapThisArg, v, k, c), k, c) === false) {
                return false;
            }
        });
    };
    return MapIterator;
})(Iterable);

var FilterIterator = (function (_super) {
    __extends(FilterIterator, _super);
    function FilterIterator(iterator, predicate, predicateThisArg) {
        _super.call(this);
        this.iterator = iterator;
        this.predicate = predicate;
        this.predicateThisArg = predicateThisArg;
    }
    FilterIterator.prototype.iterate = function (fn, thisArg) {
        var predicate = this.predicate;
        var predicateThisArg = this.predicateThisArg;
        return this.iterator.iterate(function (v, k, c) {
            if (predicate.call(predicateThisArg, v, k, c) && fn.call(thisArg, v, k, c) === false) {
                return false;
            }
        });
    };
    return FilterIterator;
})(Iterable);

module.exports = Iterable;
//# sourceMappingURL=Iterable.js.map
