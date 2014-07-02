function OrderedLazyIterable(){"use strict";}
  // abstract iterate(fn)

  OrderedLazyIterable.prototype.reverseIterate=function(fn) {"use strict";
    /**
     * Note: the default implementation of this needs to make an intermediate
     * representation which may be inefficent or at worse infinite.
     * Subclasses should do better if possible.
     */
    var temp = [];
    var collection;
    this.iterate(function(v, k, c)  {
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

  OrderedLazyIterable.prototype.toArray=function() {"use strict";
    var array = [];
    this.iterate(function(v)  { array.push(v); });
    return array;
  };

  OrderedLazyIterable.prototype.toObject=function() {"use strict";
    var object = {};
    this.iterate(function(v, k)  { object[k] = v; });
    return object;
  };

  OrderedLazyIterable.prototype.toVector=function() {"use strict";
    // Use Late Binding here to solve the circular dependency.
    var vect = require('./Vector').empty().asTransient();
    this.iterate(function(v)  { vect.push(v); });
    return vect.asPersistent();
  };

  OrderedLazyIterable.prototype.toMap=function() {"use strict";
    // Use Late Binding here to solve the circular dependency.
    return require('./Map').empty().merge(this);
  };

  OrderedLazyIterable.prototype.toSet=function() {"use strict";
    // Use Late Binding here to solve the circular dependency.
    return require('./Set').empty().merge(this);
  };

  OrderedLazyIterable.prototype.reverse=function() {"use strict";
    return new ReverseIterator(this);
  };

  OrderedLazyIterable.prototype.keys=function() {"use strict";
    return this.map(function(v, k)  {return k;}).values();
  };

  OrderedLazyIterable.prototype.values=function() {"use strict";
    // TODO: can __makeIterator reduce boilerplate?
    var iterator = this;
    var valuesIterator = function(fn, alterIndices)  {
      var iterations = 0;
      return iterator.iterate(
        function(v, k, c)  {return fn(v, iterations++, c) !== false;},
        alterIndices
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

  OrderedLazyIterable.prototype.forEach=function(fn, context) {"use strict";
    this.iterate(function(v, k, c)  { fn.call(context, v, k, c); });
  };

  OrderedLazyIterable.prototype.first=function(predicate, context) {"use strict";
    var firstValue;
    (predicate ? this.filter(predicate, context) : this).take(1).forEach(function(v)  { firstValue = v; });
    return firstValue;
  };

  OrderedLazyIterable.prototype.last=function(predicate, context) {"use strict";
    return this.reverse(true).first(predicate, context);
  };

  OrderedLazyIterable.prototype.reduce=function(reducer, initialReduction, context) {"use strict";
    var reduction = initialReduction;
    this.iterate(function(v, k, c)  {
      reduction = reducer.call(context, reduction, v, k, c);
    });
    return reduction;
  };

  OrderedLazyIterable.prototype.reduceRight=function(reducer, initialReduction, context) {"use strict";
    return this.reverse(true).reduce(reducer, initialReduction, context);
  };

  OrderedLazyIterable.prototype.every=function(predicate, context) {"use strict";
    var every = true;
    this.iterate(function(v, k, c)  {
      if (!predicate.call(context, v, k, c)) {
        every = false;
        return false;
      }
    });
    return every;
  };

  OrderedLazyIterable.prototype.some=function(predicate, context) {"use strict";
    // TODO: write a test
    return !this.every(not(predicate), context);
    // var some = false;
    // this.iterate((v, k, c) => {
    //   if (predicate.call(context, v, k, c)) {
    //     some = true;
    //     return false;
    //   }
    // });
    // return some;
  };

  OrderedLazyIterable.prototype.find=function(predicate, context) {"use strict";
    var foundValue;
    this.iterate(function(v, k, c)  {
      if (predicate.call(context, v, k, c)) {
        foundValue = v;
        return false;
      }
    });
    return foundValue;
  };

  OrderedLazyIterable.prototype.findKey=function(predicate, context) {"use strict";
    var foundKey;
    this.iterate(function(v, k, c)  {
      if (predicate.call(context, v, k, c)) {
        foundKey = k;
        return false;
      }
    });
    return foundKey;
  };

  OrderedLazyIterable.prototype.findLast=function(predicate, context) {"use strict";
    return this.reverse(true).find(predicate, context);
  };

  OrderedLazyIterable.prototype.findLastKey=function(predicate, context) {"use strict";
    return this.reverse(true).findKey(predicate, context);
  };

  OrderedLazyIterable.prototype.flip=function() {"use strict";
    var iterator = this;
    var flipIterator = function(fn, alterIndices)  {return iterator.iterate(
      function(v, k, c)  {return fn(k, v, c) !== false;},
      alterIndices
    );};
    // TODO: can __makeIterator reduce boilerplate?
    return this.__makeIterator(flipIterator, flipIterator);
  };

  OrderedLazyIterable.prototype.map=function(mapper, context) {"use strict";
    var iterator = this;
    var mapIterator = function(fn, alterIndices)  {return iterator.iterate(
      function(v, k, c)  {return fn(mapper.call(context, v, k, c), k, c) !== false;},
      alterIndices
    );};
    // TODO: can __makeIterator reduce boilerplate?
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


module.exports = OrderedLazyIterable;
