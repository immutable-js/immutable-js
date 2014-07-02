var LazyIterable = require('./LazyIterable');

for(var LazyIterable____Key in LazyIterable){if(LazyIterable.hasOwnProperty(LazyIterable____Key)){OrderedLazyIterable[LazyIterable____Key]=LazyIterable[LazyIterable____Key];}}var ____SuperProtoOfLazyIterable=LazyIterable===null?null:LazyIterable.prototype;OrderedLazyIterable.prototype=Object.create(____SuperProtoOfLazyIterable);OrderedLazyIterable.prototype.constructor=OrderedLazyIterable;OrderedLazyIterable.__superConstructor__=LazyIterable;function OrderedLazyIterable(){"use strict";if(LazyIterable!==null){LazyIterable.apply(this,arguments);}}
  // abstract iterate(fn, thisArg, reverseIndices)

  OrderedLazyIterable.prototype.reverseIterate=function(fn, thisArg, maintainIndices) {"use strict";
    /**
     * Note: the default implementation of this needs to make an intermediate
     * representation which may be inefficent or at worse infinite.
     * Subclasses should do better if possible.
     */
    var temp = [];
    var collection;
    this.iterate(function(v, i, c)  {
      collection || (collection = c);
      temp[i] = v;
    });
    for (var ii = temp.length - 1; ii >= 0; ii--) {
      if (temp.hasOwnProperty(ii) &&
          fn.call(thisArg, temp[ii], maintainIndices ? ii : temp.length - 1 - ii, collection) === false) {
        return false;
      }
    }
    return true;
  };

  OrderedLazyIterable.prototype.toArray=function() {"use strict";
    var array = [];
    this.iterate(function(v, k)  { array[k] = v; });
    return array;
  };

  OrderedLazyIterable.prototype.toVector=function() {"use strict";
    // Use Late Binding here to solve the circular dependency.
    return require('./Vector').empty().merge(this);
  };

  OrderedLazyIterable.prototype.reverse=function(maintainIndices) {"use strict";
    return new ReverseIterator(this, maintainIndices);
  };

  OrderedLazyIterable.prototype.keys=function() {"use strict";
    return this.map(function(v, k)  {return k;}).values();
  };

  OrderedLazyIterable.prototype.values=function() {"use strict";
    return new ValueIterator(this);
  };

  OrderedLazyIterable.prototype.entries=function() {"use strict";
    return this.map(function(v, k)  {return [k, v];}).values();
  };

  OrderedLazyIterable.prototype.first=function(fn, thisArg) {"use strict";
    var firstValue;
    (fn ? this.filter(fn, thisArg) : this).take(1).forEach(function(v)  { firstValue = v; });
    return firstValue;
  };

  OrderedLazyIterable.prototype.last=function(fn, thisArg) {"use strict";
    return this.reverse(true).first(fn, thisArg);
  };

  OrderedLazyIterable.prototype.reduceRight=function(fn, initialReduction, thisArg) {"use strict";
    return this.reverse(true).reduce(fn, initialReduction, thisArg);
  };

  OrderedLazyIterable.prototype.map=function(fn, thisArg) {"use strict";
    return new MapIterator(this, fn, thisArg);
  };

  OrderedLazyIterable.prototype.filter=function(fn, thisArg, maintainIndices) {"use strict";
    return new FilterIterator(this, fn, thisArg, maintainIndices);
  };

  OrderedLazyIterable.prototype.indexOf=function(searchValue) {"use strict";
    return this.findIndex(function(value)  {return value === searchValue;});
  };

  OrderedLazyIterable.prototype.lastIndexOf=function(searchValue) {"use strict";
    return this.findLastIndex(function(value)  {return value === searchValue;});
  };

  OrderedLazyIterable.prototype.findIndex=function(fn, thisArg) {"use strict";
    var key = this.findKey(fn, thisArg);
    return key == null ? -1 : key;
  };

  OrderedLazyIterable.prototype.findLast=function(fn, thisArg) {"use strict";
    return this.reverse(true).find(fn, thisArg);
  };

  OrderedLazyIterable.prototype.findLastIndex=function(fn, thisArg) {"use strict";
    return this.reverse(true).findIndex(fn, thisArg);
  };

  OrderedLazyIterable.prototype.take=function(amount) {"use strict";
    var iterations = 0;
    return this.takeWhile(function()  {return iterations++ < amount;});
  };

  OrderedLazyIterable.prototype.takeWhile=function(fn, thisArg) {"use strict";
    return new TakeIterator(this, fn, thisArg);
  };

  OrderedLazyIterable.prototype.takeUntil=function(fn, thisArg) {"use strict";
    return this.takeWhile(not(fn), thisArg);
  };

  OrderedLazyIterable.prototype.skip=function(amount, maintainIndices) {"use strict";
    var iterations = 0;
    return this.skipWhile(function()  {return iterations++ < amount;}, null, maintainIndices);
  };

  OrderedLazyIterable.prototype.skipWhile=function(fn, thisArg, maintainIndices) {"use strict";
    return new SkipIterator(this, fn, thisArg, maintainIndices);
  };

  OrderedLazyIterable.prototype.skipUntil=function(fn, thisArg, maintainIndices) {"use strict";
    return this.skipWhile(not(fn), thisArg, maintainIndices);
  };


function not(fn) {
  return function() {
    return !fn.apply(this, arguments);
  }
}

for(var OrderedLazyIterable____Key in OrderedLazyIterable){if(OrderedLazyIterable.hasOwnProperty(OrderedLazyIterable____Key)){ReverseIterator[OrderedLazyIterable____Key]=OrderedLazyIterable[OrderedLazyIterable____Key];}}var ____SuperProtoOfOrderedLazyIterable=OrderedLazyIterable===null?null:OrderedLazyIterable.prototype;ReverseIterator.prototype=Object.create(____SuperProtoOfOrderedLazyIterable);ReverseIterator.prototype.constructor=ReverseIterator;ReverseIterator.__superConstructor__=OrderedLazyIterable;
  function ReverseIterator(iterator, maintainIndices) {"use strict";
    this.iterator = iterator;
    this.maintainIndices = maintainIndices;
  }

  ReverseIterator.prototype.iterate=function(fn, thisArg, reverseIndices) {"use strict";
    return this.iterator.reverseIterate(fn, thisArg, reverseIndices !== this.maintainIndices);
  };

  ReverseIterator.prototype.reverseIterate=function(fn, thisArg, maintainIndices) {"use strict";
    return this.iterator.iterate(fn, thisArg, maintainIndices !== this.maintainIndices);
  };

  ReverseIterator.prototype.reverse=function(maintainIndices) {"use strict";
    if (maintainIndices === this.maintainIndices) {
      return this.iterator;
    }
    return ____SuperProtoOfOrderedLazyIterable.reverse.call(this,maintainIndices);
  };


for(OrderedLazyIterable____Key in OrderedLazyIterable){if(OrderedLazyIterable.hasOwnProperty(OrderedLazyIterable____Key)){ValueIterator[OrderedLazyIterable____Key]=OrderedLazyIterable[OrderedLazyIterable____Key];}}ValueIterator.prototype=Object.create(____SuperProtoOfOrderedLazyIterable);ValueIterator.prototype.constructor=ValueIterator;ValueIterator.__superConstructor__=OrderedLazyIterable;
  function ValueIterator(iterator) {"use strict";
    this.iterator = iterator;
  }

  ValueIterator.prototype.iterate=function(fn, thisArg, reverseIndices) {"use strict";
    var iterations = 0;
    return this.iterator.iterate(
      function(v, k, c)  {return fn.call(thisArg, v, iterations++, c) !== false;},
      null,
      reverseIndices
    );
  };

  // This is equivalent to values(reverse(x)) and takes advantage of the fact that
  // these two functions are commutative.
  ValueIterator.prototype.reverseIterate=function(fn, thisArg, maintainIndices) {"use strict";
    var iterations = 0;
    return this.iterator.reverseIterate(
      function(v, k, c)  {return fn.call(thisArg, v, iterations++, c) !== false;},
      null,
      maintainIndices
    );
  };


for(OrderedLazyIterable____Key in OrderedLazyIterable){if(OrderedLazyIterable.hasOwnProperty(OrderedLazyIterable____Key)){MapIterator[OrderedLazyIterable____Key]=OrderedLazyIterable[OrderedLazyIterable____Key];}}MapIterator.prototype=Object.create(____SuperProtoOfOrderedLazyIterable);MapIterator.prototype.constructor=MapIterator;MapIterator.__superConstructor__=OrderedLazyIterable;
  function MapIterator(iterator, mapper, mapThisArg) {"use strict";
    this.iterator = iterator;
    this.mapper = mapper;
    this.mapThisArg = mapThisArg;
  }

  MapIterator.prototype.iterate=function(fn, thisArg, reverseIndices) {"use strict";
    var map = this.mapper;
    var mapThisArg = this.mapThisArg;
    return this.iterator.iterate(
      function(v, k, c)  {return fn.call(thisArg, map.call(mapThisArg, v, k, c), k, c) !== false;},
      null,
      reverseIndices
    );
  };

  // This is equivalent to map(reverse(x)) and takes advantage of the fact that
  // these two functions are commutative.
  MapIterator.prototype.reverseIterate=function(fn, thisArg, maintainIndices) {"use strict";
    var map = this.mapper;
    var mapThisArg = this.mapThisArg;
    return this.iterator.reverseIterate(
      function(v, k, c)  {return fn.call(thisArg, map.call(mapThisArg, v, k, c), k, c) !== false;},
      null,
      maintainIndices
    );
  };


for(OrderedLazyIterable____Key in OrderedLazyIterable){if(OrderedLazyIterable.hasOwnProperty(OrderedLazyIterable____Key)){FilterIterator[OrderedLazyIterable____Key]=OrderedLazyIterable[OrderedLazyIterable____Key];}}FilterIterator.prototype=Object.create(____SuperProtoOfOrderedLazyIterable);FilterIterator.prototype.constructor=FilterIterator;FilterIterator.__superConstructor__=OrderedLazyIterable;
  function FilterIterator(iterator, predicate, predicateThisArg, maintainIndices) {"use strict";
    this.iterator = iterator;
    this.predicate = predicate;
    this.predicateThisArg = predicateThisArg;
    this.maintainIndices = maintainIndices;
  }

  FilterIterator.prototype.iterate=function(fn, thisArg, reverseIndices) {"use strict";
    var predicate = this.predicate;
    var predicateThisArg = this.predicateThisArg;
    var filterMaintainIndices = this.maintainIndices;
    var iterations = 0;
    return this.iterator.iterate(
      function(v, k, c) 
        {return !predicate.call(predicateThisArg, v, k, c) ||
        fn.call(thisArg, v, filterMaintainIndices ? k : iterations++, c) !== false;},
      null,
      reverseIndices
    );
  };

  // This is equivalent to filter(reverse(x)) and takes advantage of the fact that
  // these two functions are commutative.
  FilterIterator.prototype.reverseIterate=function(fn, thisArg, maintainIndices) {"use strict";
    var predicate = this.predicate;
    var predicateThisArg = this.predicateThisArg;
    var filterMaintainIndices = this.maintainIndices;
    var iterations = 0;
    return this.iterator.reverseIterate(
      function(v, k, c) 
        {return !predicate.call(predicateThisArg, v, k, c) ||
        fn.call(thisArg, v, filterMaintainIndices ? k : iterations++, c) !== false;},
      null,
      maintainIndices
    );
  };


for(OrderedLazyIterable____Key in OrderedLazyIterable){if(OrderedLazyIterable.hasOwnProperty(OrderedLazyIterable____Key)){TakeIterator[OrderedLazyIterable____Key]=OrderedLazyIterable[OrderedLazyIterable____Key];}}TakeIterator.prototype=Object.create(____SuperProtoOfOrderedLazyIterable);TakeIterator.prototype.constructor=TakeIterator;TakeIterator.__superConstructor__=OrderedLazyIterable;
  function TakeIterator(iterator, predicate, predicateThisArg) {"use strict";
    this.iterator = iterator;
    this.predicate = predicate;
    this.predicateThisArg = predicateThisArg;
  }

  TakeIterator.prototype.iterate=function(fn, thisArg, reverseIndices) {"use strict";
    var predicate = this.predicate;
    var predicateThisArg = this.predicateThisArg;
    return this.iterator.iterate(
      function(v, k, c) 
        {return predicate.call(predicateThisArg, v, k, c) &&
        fn.call(thisArg, v, k, c) !== false;},
      null,
      reverseIndices
    );
  };

          
      


for(OrderedLazyIterable____Key in OrderedLazyIterable){if(OrderedLazyIterable.hasOwnProperty(OrderedLazyIterable____Key)){SkipIterator[OrderedLazyIterable____Key]=OrderedLazyIterable[OrderedLazyIterable____Key];}}SkipIterator.prototype=Object.create(____SuperProtoOfOrderedLazyIterable);SkipIterator.prototype.constructor=SkipIterator;SkipIterator.__superConstructor__=OrderedLazyIterable;
  function SkipIterator(iterator, predicate, predicateThisArg, maintainIndices) {"use strict";
    this.iterator = iterator;
    this.predicate = predicate;
    this.predicateThisArg = predicateThisArg;
    this.maintainIndices = maintainIndices;
  }

  SkipIterator.prototype.iterate=function(fn, thisArg, reverseIndices) {"use strict";
    var predicate = this.predicate;
    var predicateThisArg = this.predicateThisArg;
    var skipMaintainIndices = this.maintainIndices;
    var iterations = 0;
    var isSkipping = true;
    return this.iterator.iterate(
      function(v, k, c) 
        {return (isSkipping = isSkipping && predicate.call(predicateThisArg, v, k, c)) ||
        fn.call(thisArg, v, skipMaintainIndices ? k : iterations++, c) !== false;},
      null,
      reverseIndices
    );
  };

          
      


module.exports = OrderedLazyIterable;
