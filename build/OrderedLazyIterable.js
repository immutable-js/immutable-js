var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='./node.d.ts'/>
var LazyIterable = require('./LazyIterable');

var OrderedLazyIterable = (function (_super) {
    __extends(OrderedLazyIterable, _super);
    function OrderedLazyIterable() {
        _super.apply(this, arguments);
    }
    // overridden to add maintainIndices to the type.
    OrderedLazyIterable.prototype.iterate = function (fn, thisArg, reverseIndices) {
        throw new Error('Abstract method');
    };

    OrderedLazyIterable.prototype.reverseIterate = function (fn, thisArg, maintainIndices) {
        /**
        * Note: the default implementation of this needs to make an intermediate
        * representation which may be inefficent or at worse infinite.
        * Subclasses should do better if possible.
        */
        var temp = [];
        var collection;
        this.iterate(function (v, i, c) {
            collection || (collection = c);
            temp[i] = v;
        });
        for (var ii = temp.length - 1; ii >= 0; ii--) {
            if (temp.hasOwnProperty(ii) && fn.call(thisArg, temp[ii], maintainIndices ? ii : temp.length - 1 - ii, collection) === false) {
                return false;
            }
        }
        return true;
    };

    OrderedLazyIterable.prototype.toArray = function () {
        var array = [];
        this.iterate(function (v, k) {
            array[k] = v;
        });
        return array;
    };

    OrderedLazyIterable.prototype.toVector = function () {
        // Use Late Binding here to solve the circular dependency.
        return require('./Vector').empty().merge(this);
    };

    OrderedLazyIterable.prototype.reverse = function (maintainIndices) {
        return new ReverseIterator(this, maintainIndices);
    };

    OrderedLazyIterable.prototype.keys = function () {
        return this.map(function (v, k) {
            return k;
        }).values();
    };

    OrderedLazyIterable.prototype.values = function () {
        return new ValueIterator(this);
    };

    OrderedLazyIterable.prototype.entries = function () {
        return this.map(function (v, k) {
            return [k, v];
        }).values();
    };

    OrderedLazyIterable.prototype.first = function (fn, thisArg) {
        var firstValue;
        (fn ? this.filter(fn, thisArg) : this).take(1).forEach(function (v) {
            return (firstValue = v);
        });
        return firstValue;
    };

    OrderedLazyIterable.prototype.last = function (fn, thisArg) {
        return this.reverse(true).first(fn, thisArg);
    };

    OrderedLazyIterable.prototype.reduceRight = function (fn, initialReduction, thisArg) {
        return this.reverse(true).reduce(fn, initialReduction, thisArg);
    };

    OrderedLazyIterable.prototype.map = function (fn, thisArg) {
        return new MapIterator(this, fn, thisArg);
    };

    OrderedLazyIterable.prototype.filter = function (fn, thisArg, maintainIndices) {
        return new FilterIterator(this, fn, thisArg, maintainIndices);
    };

    OrderedLazyIterable.prototype.indexOf = function (searchValue) {
        return this.findIndex(function (value) {
            return value === searchValue;
        });
    };

    OrderedLazyIterable.prototype.lastIndexOf = function (searchValue) {
        return this.findLastIndex(function (value) {
            return value === searchValue;
        });
    };

    OrderedLazyIterable.prototype.findIndex = function (fn, thisArg) {
        var key = this.findKey(fn, thisArg);
        return key == null ? -1 : key;
    };

    OrderedLazyIterable.prototype.findLast = function (fn, thisArg) {
        return this.reverse(true).find(fn, thisArg);
    };

    OrderedLazyIterable.prototype.findLastIndex = function (fn, thisArg) {
        return this.reverse(true).findIndex(fn, thisArg);
    };

    OrderedLazyIterable.prototype.take = function (amount) {
        var iterations = 0;
        return this.takeWhile(function () {
            return iterations++ < amount;
        });
    };

    OrderedLazyIterable.prototype.takeWhile = function (fn, thisArg) {
        return new TakeIterator(this, fn, thisArg);
    };

    OrderedLazyIterable.prototype.takeUntil = function (fn, thisArg) {
        return this.takeWhile(not(fn), thisArg);
    };

    OrderedLazyIterable.prototype.skip = function (amount, maintainIndices) {
        var iterations = 0;
        return this.skipWhile(function () {
            return iterations++ < amount;
        }, null, maintainIndices);
    };

    OrderedLazyIterable.prototype.skipWhile = function (fn, thisArg, maintainIndices) {
        return new SkipIterator(this, fn, thisArg, maintainIndices);
    };

    OrderedLazyIterable.prototype.skipUntil = function (fn, thisArg, maintainIndices) {
        return this.skipWhile(not(fn), thisArg, maintainIndices);
    };
    return OrderedLazyIterable;
})(LazyIterable);

function not(fn) {
    return function () {
        return !fn.apply(this, arguments);
    };
}

var ReverseIterator = (function (_super) {
    __extends(ReverseIterator, _super);
    function ReverseIterator(iterator, maintainIndices) {
        _super.call(this);
        this.iterator = iterator;
        this.maintainIndices = maintainIndices;
    }
    ReverseIterator.prototype.iterate = function (fn, thisArg, reverseIndices) {
        return this.iterator.reverseIterate(fn, thisArg, reverseIndices !== this.maintainIndices);
    };

    ReverseIterator.prototype.reverseIterate = function (fn, thisArg, maintainIndices) {
        return this.iterator.iterate(fn, thisArg, maintainIndices !== this.maintainIndices);
    };

    ReverseIterator.prototype.reverse = function (maintainIndices) {
        if (maintainIndices === this.maintainIndices) {
            return this.iterator;
        }
        return _super.prototype.reverse.call(this, maintainIndices);
    };
    return ReverseIterator;
})(OrderedLazyIterable);

var ValueIterator = (function (_super) {
    __extends(ValueIterator, _super);
    function ValueIterator(iterator) {
        _super.call(this);
        this.iterator = iterator;
    }
    ValueIterator.prototype.iterate = function (fn, thisArg, reverseIndices) {
        var iterations = 0;
        return this.iterator.iterate(function (v, k, c) {
            if (fn.call(thisArg, v, iterations++, c) === false) {
                return false;
            }
        }, null, reverseIndices);
    };

    // This is equivalent to values(reverse(x)) and takes advantage of the fact that
    // these two functions are commutative.
    ValueIterator.prototype.reverseIterate = function (fn, thisArg, maintainIndices) {
        var iterations = 0;
        return this.iterator.reverseIterate(function (v, k, c) {
            if (fn.call(thisArg, v, iterations++, c) === false) {
                return false;
            }
        }, null, maintainIndices);
    };
    return ValueIterator;
})(OrderedLazyIterable);

var MapIterator = (function (_super) {
    __extends(MapIterator, _super);
    function MapIterator(iterator, mapper, mapThisArg) {
        _super.call(this);
        this.iterator = iterator;
        this.mapper = mapper;
        this.mapThisArg = mapThisArg;
    }
    MapIterator.prototype.iterate = function (fn, thisArg, reverseIndices) {
        var map = this.mapper;
        var mapThisArg = this.mapThisArg;
        return this.iterator.iterate(function (v, k, c) {
            if (fn.call(thisArg, map.call(mapThisArg, v, k, c), k, c) === false) {
                return false;
            }
        }, null, reverseIndices);
    };

    // This is equivalent to map(reverse(x)) and takes advantage of the fact that
    // these two functions are commutative.
    MapIterator.prototype.reverseIterate = function (fn, thisArg, maintainIndices) {
        var map = this.mapper;
        var mapThisArg = this.mapThisArg;
        return this.iterator.reverseIterate(function (v, k, c) {
            if (fn.call(thisArg, map.call(mapThisArg, v, k, c), k, c) === false) {
                return false;
            }
        }, null, maintainIndices);
    };
    return MapIterator;
})(OrderedLazyIterable);

var FilterIterator = (function (_super) {
    __extends(FilterIterator, _super);
    function FilterIterator(iterator, predicate, predicateThisArg, maintainIndices) {
        _super.call(this);
        this.iterator = iterator;
        this.predicate = predicate;
        this.predicateThisArg = predicateThisArg;
        this.maintainIndices = maintainIndices;
    }
    FilterIterator.prototype.iterate = function (fn, thisArg, reverseIndices) {
        var predicate = this.predicate;
        var predicateThisArg = this.predicateThisArg;
        var iterations = 0;
        return this.iterator.iterate(function (v, k, c) {
            if (predicate.call(predicateThisArg, v, k, c) && fn.call(thisArg, v, this.maintainIndices ? k : iterations++, c) === false) {
                return false;
            }
        }, null, reverseIndices);
    };

    // This is equivalent to filter(reverse(x)) and takes advantage of the fact that
    // these two functions are commutative.
    FilterIterator.prototype.reverseIterate = function (fn, thisArg, maintainIndices) {
        var predicate = this.predicate;
        var predicateThisArg = this.predicateThisArg;
        var iterations = 0;
        return this.iterator.reverseIterate(function (v, k, c) {
            if (predicate.call(predicateThisArg, v, k, c) && fn.call(thisArg, v, this.maintainIndices ? k : iterations++, c) === false) {
                return false;
            }
        }, null, maintainIndices);
    };
    return FilterIterator;
})(OrderedLazyIterable);

var TakeIterator = (function (_super) {
    __extends(TakeIterator, _super);
    function TakeIterator(iterator, predicate, predicateThisArg) {
        _super.call(this);
        this.iterator = iterator;
        this.predicate = predicate;
        this.predicateThisArg = predicateThisArg;
    }
    TakeIterator.prototype.iterate = function (fn, thisArg, reverseIndices) {
        var predicate = this.predicate;
        var predicateThisArg = this.predicateThisArg;
        return this.iterator.iterate(function (v, k, c) {
            if (!predicate.call(predicateThisArg, v, k, c) || fn.call(thisArg, v, k, c) === false) {
                return false;
            }
        }, null, reverseIndices);
    };
    return TakeIterator;
})(OrderedLazyIterable);

var SkipIterator = (function (_super) {
    __extends(SkipIterator, _super);
    function SkipIterator(iterator, predicate, predicateThisArg, maintainIndices) {
        _super.call(this);
        this.iterator = iterator;
        this.predicate = predicate;
        this.predicateThisArg = predicateThisArg;
        this.maintainIndices = maintainIndices;
    }
    SkipIterator.prototype.iterate = function (fn, thisArg, reverseIndices) {
        var predicate = this.predicate;
        var predicateThisArg = this.predicateThisArg;
        var iterations = 0;
        var isSkipping = true;
        return this.iterator.iterate(function (v, k, c) {
            isSkipping = isSkipping && predicate.call(predicateThisArg, v, k, c);
            if (!isSkipping && fn.call(thisArg, v, this.maintainIndices ? k : iterations++, c) === false) {
                return false;
            }
        }, null, reverseIndices);
    };
    return SkipIterator;
})(OrderedLazyIterable);

module.exports = OrderedLazyIterable;
//# sourceMappingURL=OrderedLazyIterable.js.map
