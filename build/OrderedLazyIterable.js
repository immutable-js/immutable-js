var LazyIterable = require('./LazyIterable');

for(var LazyIterable____Key in LazyIterable){if(LazyIterable.hasOwnProperty(LazyIterable____Key)){OrderedLazyIterable[LazyIterable____Key]=LazyIterable[LazyIterable____Key];}}var ____SuperProtoOfLazyIterable=LazyIterable===null?null:LazyIterable.prototype;OrderedLazyIterable.prototype=Object.create(____SuperProtoOfLazyIterable);OrderedLazyIterable.prototype.constructor=OrderedLazyIterable;OrderedLazyIterable.__superConstructor__=LazyIterable;function OrderedLazyIterable(){"use strict";if(LazyIterable!==null){LazyIterable.apply(this,arguments);}}
  // abstract iterate(fn)

  OrderedLazyIterable.prototype.reverseIterate=function(fn) {"use strict";
    /**
     * Note: the default implementation of this needs to make an intermediate
     * representation which may be inefficent or at worse infinite.
     * Subclasses should do better if possible.
     */
    var temp = [];
    var collection;
    this.iterate(function(v, i, c)  {
      collection || (collection = c);
      temp.push([k, v]);
    });
    for (var ii = temp.length - 1; ii >= 0; ii--) {
      var entry = temp[ii];
      if (fn(entry[1], entry[0], collection) === false) {
        return false;
      }
    }
    return true;
  };

  // This and toVector should go away, or be replaced by the "LazyIterable" version
  OrderedLazyIterable.prototype.toArray=function() {"use strict";
    var array = [];
    this.iterate(function(v, k)  { array[k] = v; });
    return array;
  };

  OrderedLazyIterable.prototype.toVector=function() {"use strict";
    // Use Late Binding here to solve the circular dependency.
    return require('./Vector').empty().merge(this);
  };

  OrderedLazyIterable.prototype.reverse=function() {"use strict";
    return new ReverseIterator(this);
  };

  // This is identical to LazyIterable
  OrderedLazyIterable.prototype.keys=function() {"use strict";
    return this.map(function(v, k)  {return k;}).values();
  };

  OrderedLazyIterable.prototype.values=function() {"use strict";
    // TODO: can __makeIterator reduce boilerplate?
    var iterator = this;
    var valuesIterator = function(fn, alterIndicies)  {
      var iterations = 0;
      return iterator.iterate(
        function(v, k, c)  {return fn(v, iterations++, c) !== false;},
        alterIndicies
      );
    }
    // Late static binding, to avoid circular dependency issues.
    // values() always returns an Indexed sequence.
    var IndexedLazyIterable = require('./IndexedLazyIterable');
    return IndexedLazyIterable.prototype.__makeIterator.call(this, valuesIterator, valuesIterator);
  };

  OrderedLazyIterable.prototype.entries=function() {"use strict";
    return this.map(function(v, k)  {return [k, v];}).values();
  };

  OrderedLazyIterable.prototype.first=function(predicate, context) {"use strict";
    var firstValue;
    (fn ? this.filter(predicate, context) : this).take(1).forEach(function(v)  { firstValue = v; });
    return firstValue;
  };

  OrderedLazyIterable.prototype.last=function(predicate, context) {"use strict";
    return this.reverse(true).first(predicate, context);
  };

  OrderedLazyIterable.prototype.reduceRight=function(reducer, initialReduction, context) {"use strict";
    return this.reverse(true).reduce(reducer, initialReduction, context);
  };

  OrderedLazyIterable.prototype.map=function(mapper, context) {"use strict";
    var mapIterator = function(fn, alterIndices)  {return iterator.iterate(
      function(v, k, c)  {return fn(mapper.call(context, v, k, c), k, c) !== false;},
      alterIndices
    );};
    // TODO: can __makeIterator reduce boilerplate?
    var iterator = this;
    return this.__makeIterator(mapIterator, mapIterator);
  };

  // remove "maintainIndicies"
  OrderedLazyIterable.prototype.filter=function(predicate, context) {"use strict";
    var iterator = this;
    var filterIterator = function(fn, alterIndices)  {return iterator.iterate(
      function(v, k, c)  {return !predicate.call(context, v, k, c) || fn(v, k, c) !== false;},
      alterIndices
    );};
    return this.__makeIterator(filterIterator, filterIterator);
  };

  OrderedLazyIterable.prototype.findLast=function(predicate, context) {"use strict";
    return this.reverse(true).find(predicate, context);
  };

  OrderedLazyIterable.prototype.findLastKey=function(predicate, context) {"use strict";
    return this.reverse(true).findKey(predicate, context);
  };

  OrderedLazyIterable.prototype.take=function(amount) {"use strict";
    var iterations = 0;
    return this.takeWhile(function()  {return iterations++ < amount;});
  };

  OrderedLazyIterable.prototype.takeWhile=function(predicate, context) {"use strict";
    // TODO: can __makeIterator reduce boilerplate?
    var iterator = this;
    return this.__makeIterator(
      function(fn, reverseIndices)  {return iterator.iterate(
        function(v, k, c)  {return predicate.call(context, v, k, c) && fn(v, k, c) !== false;},
        reverseIndices
      );}
      // reverse(take(x)) and take(reverse(x)) are not commutative.
    );
  };

  OrderedLazyIterable.prototype.takeUntil=function(predicate, context) {"use strict";
    return this.takeWhile(not(predicate), context);
  };

  OrderedLazyIterable.prototype.skip=function(amount) {"use strict";
    var iterations = 0;
    return this.skipWhile(function()  {return iterations++ < amount;}, null);
  };

  OrderedLazyIterable.prototype.skipWhile=function(predicate, context) {"use strict";
    // TODO: can __makeIterator reduce boilerplate?
    var iterator = this;
    return this.__makeIterator(
      function(fn, reverseIndices)  {
        var isSkipping = true;
        return iterator.iterate(
          function(v, k, c) 
            {return (isSkipping = isSkipping && predicate.call(context, v, k, c)) ||
            fn(v, k, c) !== false;},
          reverseIndices
        );
      }
      // reverse(skip(x)) and skip(reverse(x)) are not commutative.
    );
  };

  OrderedLazyIterable.prototype.skipUntil=function(predicate, context) {"use strict";
    return this.skipWhile(not(predicate), context);
  };

  OrderedLazyIterable.prototype.__makeIterator=function(iterate, reverseIterate) {"use strict";
    var iterator = Object.create(OrderedLazyIterable.prototype);
    iterator.iterate = iterate;
    reverseIterate && (iterator.reverseIterate = reverseIterate);
    return iterator;
  };


function not(predicate) {
  return function() {
    return !predicate.apply(this, arguments);
  }
}

for(var OrderedLazyIterable____Key in OrderedLazyIterable){if(OrderedLazyIterable.hasOwnProperty(OrderedLazyIterable____Key)){ReverseIterator[OrderedLazyIterable____Key]=OrderedLazyIterable[OrderedLazyIterable____Key];}}var ____SuperProtoOfOrderedLazyIterable=OrderedLazyIterable===null?null:OrderedLazyIterable.prototype;ReverseIterator.prototype=Object.create(____SuperProtoOfOrderedLazyIterable);ReverseIterator.prototype.constructor=ReverseIterator;ReverseIterator.__superConstructor__=OrderedLazyIterable;
  function ReverseIterator(iterator) {"use strict";
    this.iterator = iterator;
  }

  ReverseIterator.prototype.iterate=function(fn) {"use strict";
    return this.iterator.reverseIterate(fn);
  };

  ReverseIterator.prototype.reverseIterate=function(fn) {"use strict";
    return this.iterator.iterate(fn);
  };

  ReverseIterator.prototype.reverse=function() {"use strict";
    return this.iterator;
  };


// // TODO: this needs to be lazily done.
// class ValueIterator extends IndexedLazyIterable {
//   constructor(iterator) {
//     this.iterator = iterator;
//   }

//   iterate(fn, reverseIndices) {
//     var iterations = 0;
//     return this.iterator.iterate(
//       (v, k, c) => fn(v, iterations++, c) !== false,
//       null,
//       reverseIndices
//     );
//   }

//   // This is equivalent to values(reverse(x)) and takes advantage of the fact that
//   // these two functions are commutative.
//   reverseIterate(fn, maintainIndices) {
//     var iterations = 0;
//     return this.iterator.reverseIterate(
//       (v, k, c) => fn(v, iterations++, c) !== false,
//       null,
//       maintainIndices
//     );
//   }
// }

// class MapIterator extends OrderedLazyIterable {
//   constructor(iterator, mapper, mapThisArg) {
//     this.iterator = iterator;
//     this.mapper = mapper;
//     this.mapThisArg = mapThisArg;
//   }

//   iterate(fn, reverseIndices) {
//     var map = this.mapper;
//     var mapThisArg = this.mapThisArg;
//     return this.iterator.iterate(
//       (v, k, c) => fn(map.call(mapThisArg, v, k, c), k, c) !== false,
//       null,
//       reverseIndices
//     );
//   }

//   // This is equivalent to map(reverse(x)) and takes advantage of the fact that
//   // these two functions are commutative.
//   reverseIterate(fn, maintainIndices) {
//     var map = this.mapper;
//     var mapThisArg = this.mapThisArg;
//     return this.iterator.reverseIterate(
//       (v, k, c) => fn(map.call(mapThisArg, v, k, c), k, c) !== false,
//       null,
//       maintainIndices
//     );
//   }
// }

// class FilterIterator extends OrderedLazyIterable {
//   constructor(iterator, predicate, predicateThisArg) {
//     this.iterator = iterator;
//     this.predicate = predicate;
//     this.predicateThisArg = predicateThisArg;
//   }

//   iterate(fn, reverseIndices) {
//     var predicate = this.predicate;
//     var predicateThisArg = this.predicateThisArg;
//     return this.iterator.iterate(
//       (v, k, c) =>
//         !predicate.call(predicateThisArg, v, k, c) ||
//         fn(v, k, c) !== false,
//       null,
//       reverseIndices
//     );
//   }

//   // This is equivalent to filter(reverse(x)) and takes advantage of the fact that
//   // these two functions are commutative.
//   reverseIterate(fn, maintainIndices) {
//     var predicate = this.predicate;
//     var predicateThisArg = this.predicateThisArg;
//     return this.iterator.reverseIterate(
//       (v, k, c) =>
//         !predicate.call(predicateThisArg, v, k, c) ||
//         fn(v, k, c) !== false,
//       null,
//       maintainIndices
//     );
//   }
// }

// class TakeIterator extends OrderedLazyIterable {
//   constructor(iterator, predicate, predicateThisArg) {
//     this.iterator = iterator;
//     this.predicate = predicate;
//     this.predicateThisArg = predicateThisArg;
//   }

//   iterate(fn, reverseIndices) {
//     var predicate = this.predicate;
//     var predicateThisArg = this.predicateThisArg;
//     return this.iterator.iterate(
//       (v, k, c) =>
//         predicate.call(predicateThisArg, v, k, c) &&
//         fn(v, k, c) !== false,
//       null,
//       reverseIndices
//     );
//   }

//   // Use default impl for reverseIterate because reverse(take(x)) and
//   // take(reverse(x)) are not commutative.
// }

// class SkipIterator extends OrderedLazyIterable {
//   constructor(iterator, predicate, predicateThisArg) {
//     this.iterator = iterator;
//     this.predicate = predicate;
//     this.predicateThisArg = predicateThisArg;
//   }

//   iterate(fn, reverseIndices) {
//     var predicate = this.predicate;
//     var predicateThisArg = this.predicateThisArg;
//     var isSkipping = true;
//     return this.iterator.iterate(
//       (v, k, c) =>
//         (isSkipping = isSkipping && predicate.call(predicateThisArg, v, k, c)) ||
//         fn(v, k, c) !== false,
//       null,
//       reverseIndices
//     );
//   }

//   // Use default impl for reverseIterate because reverse(skip(x)) and
//   // skip(reverse(x)) are not commutative.
// }

module.exports = OrderedLazyIterable;
