var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Iterable = require('./Iterable');

var OrderedIterable = (function (_super) {
    __extends(OrderedIterable, _super);
    function OrderedIterable() {
        _super.apply(this, arguments);
    }
    OrderedIterable.prototype.toArray = function () {
        var array = [];
        this.iterate(function (v, k) {
            array[k] = v;
        });
        return array;
    };

    OrderedIterable.prototype.keys = function () {
        return this.map(function (v, k) {
            return k;
        });
    };

    OrderedIterable.prototype.map = function (fn, thisArg) {
        return new MapIterator(this, fn, thisArg);
    };

    OrderedIterable.prototype.filter = function (fn, thisArg) {
        return new FilterIterator(this, fn, thisArg);
    };

    OrderedIterable.prototype.indexOf = function (searchValue) {
        return this.findIndex(function (value) {
            return value === searchValue;
        });
    };

    OrderedIterable.prototype.findIndex = function (fn, thisArg) {
        var index = this.find(fn, thisArg);
        return index == null ? -1 : index;
    };

    OrderedIterable.prototype.take = function (amount) {
        var iterations = 0;
        return this.takeWhile(function () {
            return iterations++ < amount;
        });
    };

    OrderedIterable.prototype.skip = function (amount) {
        var iterations = 0;
        return this.skipWhile(function () {
            return iterations++ < amount;
        });
    };

    OrderedIterable.prototype.takeWhile = function (fn, thisArg) {
        return new TakeIterator(this, fn, thisArg);
    };

    OrderedIterable.prototype.skipWhile = function (fn, thisArg) {
        return new SkipIterator(this, fn, thisArg);
    };
    return OrderedIterable;
})(Iterable);


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
            if (fn.call(thisArg, map.call(mapThisArg, v, k, c), k, c) === false) {
                return false;
            }
        });
    };
    return MapIterator;
})(OrderedIterable);

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
        var iterations = 0;
        return this.iterator.iterate(function (v, k, c) {
            if (predicate.call(predicateThisArg, v, k, c) && fn.call(thisArg, v, iterations++, c) === false) {
                return false;
            }
        });
    };
    return FilterIterator;
})(OrderedIterable);

var TakeIterator = (function (_super) {
    __extends(TakeIterator, _super);
    function TakeIterator(iterator, predicate, predicateThisArg) {
        _super.call(this, iterator.collection);
        this.iterator = iterator;
        this.predicate = predicate;
        this.predicateThisArg = predicateThisArg;
    }
    TakeIterator.prototype.iterate = function (fn, thisArg) {
        var predicate = this.predicate;
        var predicateThisArg = this.predicateThisArg;
        return this.iterator.iterate(function (v, k, c) {
            if (!predicate.call(predicateThisArg, v, k, c) || fn.call(thisArg, v, k, c) === false) {
                return false;
            }
        });
    };
    return TakeIterator;
})(OrderedIterable);

var SkipIterator = (function (_super) {
    __extends(SkipIterator, _super);
    function SkipIterator(iterator, predicate, predicateThisArg) {
        _super.call(this, iterator.collection);
        this.iterator = iterator;
        this.predicate = predicate;
        this.predicateThisArg = predicateThisArg;
    }
    SkipIterator.prototype.iterate = function (fn, thisArg) {
        var predicate = this.predicate;
        var predicateThisArg = this.predicateThisArg;
        var iterations = 0;
        var isSkipping = true;
        return this.iterator.iterate(function (v, k, c) {
            isSkipping = isSkipping && predicate.call(predicateThisArg, v, k, c);
            if (!isSkipping && fn.call(thisArg, v, iterations++, c) === false) {
                return false;
            }
        });
    };
    return SkipIterator;
})(OrderedIterable);
module.exports = OrderedIterable;
