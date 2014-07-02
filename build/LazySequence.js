
  function LazySequence(value) {"use strict";
    if (value instanceof LazySequence) {
      return value;
    }
    if (Array.isArray(value)) {
      // Use Late Binding here to solve the circular dependency.
      var LazyArraySequence = require('./LazyArraySequence');
      return new LazyArraySequence(value);
    }
    if (typeof value === 'object') {
      // Use Late Binding here to solve the circular dependency.
      var LazyObjectSequence = require('./LazyObjectSequence');
      return new LazyObjectSequence(value);
    }
    return null;
  }

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
    // values() always returns an Indexed sequence.
    // Late static binding, to avoid circular dependency issues.
    return require('./LazyIndexedSequence').prototype.__makeSequence.call(this, true, function(fn)  {
      var iterations = 0;
      return function(v, k, c)  {return fn(v, iterations++, c) !== false;}
    });
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
    return !this.every(not(predicate), context);
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
    return this.__makeSequence(true, flipFactory);
  };

  LazySequence.prototype.map=function(mapper, context) {"use strict";
    return this.__makeSequence(true, function(fn)  {return function(v, k, c) 
      {return fn(mapper.call(context, v, k, c), k, c) !== false;};}
    );
  };

  LazySequence.prototype.filter=function(predicate, context) {"use strict";
    return this.__makeSequence(true, function(fn)  {return function(v, k, c) 
      {return !predicate.call(context, v, k, c) || fn(v, k, c) !== false;};}
    );
  };

  LazySequence.prototype.take=function(amount) {"use strict";
    var iterations = 0;
    return this.takeWhile(function()  {return iterations++ < amount;});
  };

  LazySequence.prototype.takeWhile=function(predicate, context) {"use strict";
    return this.__makeSequence(false, function(fn)  {return function(v, k, c) 
      {return predicate.call(context, v, k, c) && fn(v, k, c) !== false;};}
    );
  };

  LazySequence.prototype.takeUntil=function(predicate, context) {"use strict";
    return this.takeWhile(not(predicate), context);
  };

  LazySequence.prototype.skip=function(amount) {"use strict";
    var iterations = 0;
    return this.skipWhile(function()  {return iterations++ < amount;});
  };

  LazySequence.prototype.skipWhile=function(predicate, context) {"use strict";
    return this.__makeSequence(false, function(fn)  {
      var isSkipping = true;
      return function(v, k, c) 
        {return (isSkipping = isSkipping && predicate.call(context, v, k, c)) ||
        fn(v, k, c) !== false;}
    });
  };

  LazySequence.prototype.skipUntil=function(predicate, context) {"use strict";
    return this.skipWhile(not(predicate), context);
  };

  // __iterate(fn)

  /**
   * Note: the default implementation of this needs to make an intermediate
   * representation which may be inefficent or at worse infinite.
   * Subclasses should do better if possible.
   */
  LazySequence.prototype.__reverseIterate=function(fn) {"use strict";
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

  LazySequence.prototype.__makeSequence=function(withCommutativeReverse, factory) {"use strict";
    var sequence = this;
    var newSequence = Object.create(LazySequence.prototype);
    newSequence.__iterate = function(fn)  {return sequence.__iterate(factory(fn));};
    if (withCommutativeReverse) {
      newSequence.__reverseIterate = function(fn)  {return sequence.__reverseIterate(factory(fn));};
    }
    return newSequence;
  };


function id(fn) {
  return fn;
}

function flipFactory(fn) {
  return function(v, k, c)  {return fn(k, v, c) !== false;};
}

function not(predicate) {
  return function() {
    return !predicate.apply(this, arguments);
  }
}

for(var LazySequence____Key in LazySequence){if(LazySequence.hasOwnProperty(LazySequence____Key)){ReverseIterator[LazySequence____Key]=LazySequence[LazySequence____Key];}}var ____SuperProtoOfLazySequence=LazySequence===null?null:LazySequence.prototype;ReverseIterator.prototype=Object.create(____SuperProtoOfLazySequence);ReverseIterator.prototype.constructor=ReverseIterator;ReverseIterator.__superConstructor__=LazySequence;
  function ReverseIterator(iterator) {"use strict";
    this.iterator = iterator;
  }

  ReverseIterator.prototype.reverse=function() {"use strict";
    return this.iterator;
  };

  ReverseIterator.prototype.__iterate=function(fn) {"use strict";
    return this.iterator.__reverseIterate(fn);
  };

  ReverseIterator.prototype.__reverseIterate=function(fn) {"use strict";
    return this.iterator.__iterate(fn);
  };


module.exports = LazySequence;
