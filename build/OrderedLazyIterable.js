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
    /**
    * Note: the default implementation of this needs to make an intermediate
    * representation which may be inefficent. Concrete data structures should
    * do better if possible.
    */
    OrderedLazyIterable.prototype.reverseIterate = function (fn, thisArg) {
        var tempKV = [];
        var collection;
        this.iterate(function (v, k, c) {
            if (!collection) {
                collection = c;
            }
            tempKV.push([k, v]);
        });
        for (var ii = tempKV.length - 1; ii >= 0; ii--) {
            if (fn.call(thisArg, tempKV[ii][1], tempKV[ii][0], collection) === false) {
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

    OrderedLazyIterable.prototype.reverse = function () {
        return new ReverseIterator(this);
    };

    OrderedLazyIterable.prototype.keys = function () {
        return this.map(function (v, k) {
            return k;
        }).values();
    };

    OrderedLazyIterable.prototype.values = function () {
        return new ValueIterator(this);
    };

    OrderedLazyIterable.prototype.map = function (fn, thisArg) {
        return new MapIterator(this, fn, thisArg);
    };

    OrderedLazyIterable.prototype.filter = function (fn, thisArg) {
        return new FilterIterator(this, fn, thisArg);
    };

    OrderedLazyIterable.prototype.indexOf = function (searchValue) {
        return this.findIndex(function (value) {
            return value === searchValue;
        });
    };

    OrderedLazyIterable.prototype.findIndex = function (fn, thisArg) {
        var index = this.find(fn, thisArg);
        return index == null ? -1 : index;
    };

    OrderedLazyIterable.prototype.take = function (amount) {
        var iterations = 0;
        return this.takeWhile(function () {
            return iterations++ < amount;
        });
    };

    OrderedLazyIterable.prototype.skip = function (amount) {
        var iterations = 0;
        return this.skipWhile(function () {
            return iterations++ < amount;
        });
    };

    OrderedLazyIterable.prototype.takeWhile = function (fn, thisArg) {
        return new TakeIterator(this, fn, thisArg);
    };

    OrderedLazyIterable.prototype.skipWhile = function (fn, thisArg) {
        return new SkipIterator(this, fn, thisArg);
    };
    return OrderedLazyIterable;
})(LazyIterable);

var ReverseIterator = (function (_super) {
    __extends(ReverseIterator, _super);
    function ReverseIterator(iterator) {
        _super.call(this);
        this.iterator = iterator;
    }
    ReverseIterator.prototype.iterate = function (fn, thisArg) {
        return this.iterator.reverseIterate(fn, thisArg);
    };

    ReverseIterator.prototype.reverseIterate = function (fn, thisArg) {
        return this.iterator.iterate(fn, thisArg);
    };

    ReverseIterator.prototype.reverse = function () {
        return this.iterator;
    };
    return ReverseIterator;
})(OrderedLazyIterable);

var ValueIterator = (function (_super) {
    __extends(ValueIterator, _super);
    function ValueIterator(iterator) {
        _super.call(this);
        this.iterator = iterator;
    }
    ValueIterator.prototype.iterate = function (fn, thisArg) {
        var iterations = 0;
        return this.iterator.iterate(function (v, k, c) {
            if (fn.call(thisArg, v, iterations++, c) === false) {
                return false;
            }
        });
    };

    ValueIterator.prototype.reverseIterate = function (fn, thisArg) {
        var iterations = 0;
        return this.iterator.reverseIterate(function (v, k, c) {
            if (fn.call(thisArg, v, iterations++, c) === false) {
                return false;
            }
        });
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
    MapIterator.prototype.iterate = function (fn, thisArg) {
        var map = this.mapper;
        var mapThisArg = this.mapThisArg;
        return this.iterator.iterate(function (v, k, c) {
            if (fn.call(thisArg, map.call(mapThisArg, v, k, c), k, c) === false) {
                return false;
            }
        });
    };

    MapIterator.prototype.reverseIterate = function (fn, thisArg) {
        var map = this.mapper;
        var mapThisArg = this.mapThisArg;
        return this.iterator.reverseIterate(function (v, k, c) {
            if (fn.call(thisArg, map.call(mapThisArg, v, k, c), k, c) === false) {
                return false;
            }
        });
    };
    return MapIterator;
})(OrderedLazyIterable);

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
        var iterations = 0;
        return this.iterator.iterate(function (v, k, c) {
            if (predicate.call(predicateThisArg, v, k, c) && fn.call(thisArg, v, iterations++, c) === false) {
                return false;
            }
        });
    };

    FilterIterator.prototype.reverseIterate = function (fn, thisArg) {
        var predicate = this.predicate;
        var predicateThisArg = this.predicateThisArg;
        var iterations = 0;
        return this.iterator.reverseIterate(function (v, k, c) {
            if (predicate.call(predicateThisArg, v, k, c) && fn.call(thisArg, v, iterations++, c) === false) {
                return false;
            }
        });
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
    TakeIterator.prototype.iterate = function (fn, thisArg) {
        var predicate = this.predicate;
        var predicateThisArg = this.predicateThisArg;
        return this.iterator.iterate(function (v, k, c) {
            if (!predicate.call(predicateThisArg, v, k, c) || fn.call(thisArg, v, k, c) === false) {
                return false;
            }
        });
    };

    TakeIterator.prototype.reverseIterate = function (fn, thisArg) {
        var predicate = this.predicate;
        var predicateThisArg = this.predicateThisArg;
        return this.iterator.reverseIterate(function (v, k, c) {
            if (!predicate.call(predicateThisArg, v, k, c) || fn.call(thisArg, v, k, c) === false) {
                return false;
            }
        });
    };
    return TakeIterator;
})(OrderedLazyIterable);

var SkipIterator = (function (_super) {
    __extends(SkipIterator, _super);
    function SkipIterator(iterator, predicate, predicateThisArg) {
        _super.call(this);
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

    SkipIterator.prototype.reverseIterate = function (fn, thisArg) {
        var predicate = this.predicate;
        var predicateThisArg = this.predicateThisArg;
        var iterations = 0;
        var isSkipping = true;
        return this.iterator.reverseIterate(function (v, k, c) {
            isSkipping = isSkipping && predicate.call(predicateThisArg, v, k, c);
            if (!isSkipping && fn.call(thisArg, v, iterations++, c) === false) {
                return false;
            }
        });
    };
    return SkipIterator;
})(OrderedLazyIterable);

module.exports = OrderedLazyIterable;
//# sourceMappingURL=OrderedLazyIterable.js.map
