
  // abstract __iterate(fn)

  function LazySequence(obj) {"use strict";
    require('./Persistent').lazy(obj);
  }

  LazySequence.prototype.__reverseIterate=function(fn) {"use strict";
    /**
     * Note: the default implementation of this needs to make an intermediate
     * representation which may be inefficent or at worse infinite.
     * Subclasses should do better if possible.
     */
    var temp = [];
    var collection;
    this.__iterate(function(v, k, c)  {
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

  LazySequence.prototype.toArray=function() {"use strict";
    var array = [];
    this.__iterate(function(v)  { array.push(v); });
    return array;
  };

  LazySequence.prototype.toObject=function() {"use strict";
    var object = {};
    this.__iterate(function(v, k)  { object[k] = v; });
    return object;
  };

  LazySequence.prototype.toVector=function() {"use strict";
    // Use Late Binding here to solve the circular dependency.
    var vect = require('./Vector').empty().asTransient();
    this.__iterate(function(v)  { vect.push(v); });
    return vect.asPersistent();
  };

  LazySequence.prototype.toMap=function() {"use strict";
    // Use Late Binding here to solve the circular dependency.
    return require('./Map').empty().merge(this);
  };

  LazySequence.prototype.toSet=function() {"use strict";
    // Use Late Binding here to solve the circular dependency.
    return require('./Set').empty().merge(this);
  };

  LazySequence.prototype.reverse=function() {"use strict";
    return new ReverseIterator(this);
  };

  LazySequence.prototype.keys=function() {"use strict";
    return this.map(function(v, k)  {return k;}).values();
  };

  LazySequence.prototype.values=function() {"use strict";
    // TODO: can __makeIterator reduce boilerplate?
    var iterator = this;
    var valuesIterator = function(fn, alterIndices)  {
      var iterations = 0;
      return iterator.__iterate(
        function(v, k, c)  {return fn(v, iterations++, c) !== false;},
        alterIndices
      );
    }
    // Late static binding, to avoid circular dependency issues.
    // values() always returns an Indexed sequence.
    var LazyIndexedSequence = require('./LazyIndexedSequence');
    return LazyIndexedSequence.prototype.__makeIterator.call(this, valuesIterator, valuesIterator);
  };

  LazySequence.prototype.entries=function() {"use strict";
    return this.map(function(v, k)  {return [k, v];}).values();
  };

  LazySequence.prototype.forEach=function(fn, context) {"use strict";
    this.__iterate(function(v, k, c)  { fn.call(context, v, k, c); });
  };

  LazySequence.prototype.first=function(predicate, context) {"use strict";
    var firstValue;
    (predicate ? this.filter(predicate, context) : this).take(1).forEach(function(v)  { firstValue = v; });
    return firstValue;
  };

  LazySequence.prototype.last=function(predicate, context) {"use strict";
    return this.reverse(true).first(predicate, context);
  };

  LazySequence.prototype.reduce=function(reducer, initialReduction, context) {"use strict";
    var reduction = initialReduction;
    this.__iterate(function(v, k, c)  {
      reduction = reducer.call(context, reduction, v, k, c);
    });
    return reduction;
  };

  LazySequence.prototype.reduceRight=function(reducer, initialReduction, context) {"use strict";
    return this.reverse(true).reduce(reducer, initialReduction, context);
  };

  LazySequence.prototype.every=function(predicate, context) {"use strict";
    var every = true;
    this.__iterate(function(v, k, c)  {
      if (!predicate.call(context, v, k, c)) {
        every = false;
        return false;
      }
    });
    return every;
  };

  LazySequence.prototype.some=function(predicate, context) {"use strict";
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

  LazySequence.prototype.find=function(predicate, context) {"use strict";
    var foundValue;
    this.__iterate(function(v, k, c)  {
      if (predicate.call(context, v, k, c)) {
        foundValue = v;
        return false;
      }
    });
    return foundValue;
  };

  LazySequence.prototype.findKey=function(predicate, context) {"use strict";
    var foundKey;
    this.__iterate(function(v, k, c)  {
      if (predicate.call(context, v, k, c)) {
        foundKey = k;
        return false;
      }
    });
    return foundKey;
  };

  LazySequence.prototype.findLast=function(predicate, context) {"use strict";
    return this.reverse(true).find(predicate, context);
  };

  LazySequence.prototype.findLastKey=function(predicate, context) {"use strict";
    return this.reverse(true).findKey(predicate, context);
  };

  LazySequence.prototype.flip=function() {"use strict";
    var iterator = this;
    var flipIterator = function(fn, alterIndices)  {return iterator.__iterate(
      function(v, k, c)  {return fn(k, v, c) !== false;},
      alterIndices
    );};
    // TODO: can __makeIterator reduce boilerplate?
    return this.__makeIterator(flipIterator, flipIterator);
  };

  LazySequence.prototype.map=function(mapper, context) {"use strict";
    var iterator = this;
    var mapIterator = function(fn, alterIndices)  {return iterator.__iterate(
      function(v, k, c)  {return fn(mapper.call(context, v, k, c), k, c) !== false;},
      alterIndices
    );};
    // TODO: can __makeIterator reduce boilerplate?
    return this.__makeIterator(mapIterator, mapIterator);
  };

  // remove "maintainIndicies"
  LazySequence.prototype.filter=function(predicate, context) {"use strict";
    var iterator = this;
    var filterIterator = function(fn, alterIndices)  {return iterator.__iterate(
      function(v, k, c)  {return !predicate.call(context, v, k, c) || fn(v, k, c) !== false;},
      alterIndices
    );};
    return this.__makeIterator(filterIterator, filterIterator);
  };

  LazySequence.prototype.take=function(amount) {"use strict";
    var iterations = 0;
    return this.takeWhile(function()  {return iterations++ < amount;});
  };

  LazySequence.prototype.takeWhile=function(predicate, context) {"use strict";
    // TODO: can __makeIterator reduce boilerplate?
    var iterator = this;
    return this.__makeIterator(
      function(fn, reverseIndices)  {return iterator.__iterate(
        function(v, k, c)  {return predicate.call(context, v, k, c) && fn(v, k, c) !== false;},
        reverseIndices
      );}
      // reverse(take(x)) and take(reverse(x)) are not commutative.
    );
  };

  LazySequence.prototype.takeUntil=function(predicate, context) {"use strict";
    return this.takeWhile(not(predicate), context);
  };

  LazySequence.prototype.skip=function(amount) {"use strict";
    var iterations = 0;
    return this.skipWhile(function()  {return iterations++ < amount;}, null);
  };

  LazySequence.prototype.skipWhile=function(predicate, context) {"use strict";
    // TODO: can __makeIterator reduce boilerplate?
    var iterator = this;
    return this.__makeIterator(
      function(fn, reverseIndices)  {
        var isSkipping = true;
        return iterator.__iterate(
          function(v, k, c) 
            {return (isSkipping = isSkipping && predicate.call(context, v, k, c)) ||
            fn(v, k, c) !== false;},
          reverseIndices
        );
      }
      // reverse(skip(x)) and skip(reverse(x)) are not commutative.
    );
  };

  LazySequence.prototype.skipUntil=function(predicate, context) {"use strict";
    return this.skipWhile(not(predicate), context);
  };

  LazySequence.prototype.__makeIterator=function(iterate, reverseIterate) {"use strict";
    var iterator = Object.create(LazySequence.prototype);
    iterator.__iterate = iterate;
    reverseIterate && (iterator.__reverseIterate = reverseIterate);
    return iterator;
  };


function not(predicate) {
  return function() {
    return !predicate.apply(this, arguments);
  }
}

for(var LazySequence____Key in LazySequence){if(LazySequence.hasOwnProperty(LazySequence____Key)){ReverseIterator[LazySequence____Key]=LazySequence[LazySequence____Key];}}var ____SuperProtoOfLazySequence=LazySequence===null?null:LazySequence.prototype;ReverseIterator.prototype=Object.create(____SuperProtoOfLazySequence);ReverseIterator.prototype.constructor=ReverseIterator;ReverseIterator.__superConstructor__=LazySequence;
  function ReverseIterator(iterator) {"use strict";
    this.iterator = iterator;
  }

  ReverseIterator.prototype.__iterate=function(fn) {"use strict";
    return this.iterator.__reverseIterate(fn);
  };

  ReverseIterator.prototype.__reverseIterate=function(fn) {"use strict";
    return this.iterator.__iterate(fn);
  };

  ReverseIterator.prototype.reverse=function() {"use strict";
    return this.iterator;
  };


module.exports = LazySequence;
