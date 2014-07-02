function LazyIterable(){"use strict";}
  // abstract iterate(fn)

  LazyIterable.prototype.toArray=function() {"use strict";
    var array = [];
    this.iterate(function(v)  { array.push(v); });
    return array;
  };

  LazyIterable.prototype.toObject=function() {"use strict";
    var object = {};
    this.iterate(function(v, k)  { object[k] = v; });
    return object;
  };

  LazyIterable.prototype.toVector=function() {"use strict";
    // Use Late Binding here to solve the circular dependency.
    var vect = require('./Vector').empty().asTransient();
    this.iterate(function(v)  { vect.push(v); });
    return vect.asPersistent();
  };

  LazyIterable.prototype.toMap=function() {"use strict";
    // Use Late Binding here to solve the circular dependency.
    return require('./Map').empty().merge(this);
  };

  LazyIterable.prototype.toSet=function() {"use strict";
    // Use Late Binding here to solve the circular dependency.
    return require('./Set').empty().merge(this);
  };

  LazyIterable.prototype.keys=function() {"use strict";
    return this.map(function(v, k)  {return k;}).values();
  };

  LazyIterable.prototype.values=function() {"use strict";
    return new ValueIterator(this);
  };

  LazyIterable.prototype.entries=function() {"use strict";
    return this.map(function(v, k)  {return [k, v];}).values();
  };

  LazyIterable.prototype.forEach=function(fn, thisArg) {"use strict";
    this.iterate(function(v, k, c)  { fn.call(thisArg, v, k, c); });
  };

  LazyIterable.prototype.find=function(fn, thisArg) {"use strict";
    var foundValue;
    this.iterate(function(v, k, c)  {
      if (fn.call(thisArg, v, k, c)) {
        foundValue = v;
        return false;
      }
    });
    return foundValue;
  };

  LazyIterable.prototype.findKey=function(fn, thisArg) {"use strict";
    var foundKey;
    this.iterate(function(v, k, c)  {
      if (fn.call(thisArg, v, k, c)) {
        foundKey = k;
        return false;
      }
    });
    return foundKey;
  };

  LazyIterable.prototype.reduce=function(fn, initialReduction, thisArg) {"use strict";
    var reduction = initialReduction;
    this.iterate(function(v, k, c)  {
      reduction = fn.call(thisArg, reduction, v, k, c);
    });
    return reduction;
  };

  LazyIterable.prototype.flip=function() {"use strict";
    return new FlipIterator(this);
  };

  LazyIterable.prototype.map=function(fn, thisArg) {"use strict";
    return new MapIterator(this, fn, thisArg);
  };

  LazyIterable.prototype.filter=function(fn, thisArg) {"use strict";
    return new FilterIterator(this, fn, thisArg);
  };

  LazyIterable.prototype.every=function(fn, thisArg) {"use strict";
    var every = true;
    this.iterate(function(v, k, c)  {
      if (!fn.call(thisArg, v, k, c)) {
        every = false;
        return false;
      }
    });
    return every;
  };

  LazyIterable.prototype.some=function(fn, thisArg) {"use strict";
    var some = false;
    this.iterate(function(v, k, c)  {
      if (fn.call(thisArg, v, k, c)) {
        some = true;
        return false;
      }
    });
    return some;
  };


for(var LazyIterable____Key in LazyIterable){if(LazyIterable.hasOwnProperty(LazyIterable____Key)){FlipIterator[LazyIterable____Key]=LazyIterable[LazyIterable____Key];}}var ____SuperProtoOfLazyIterable=LazyIterable===null?null:LazyIterable.prototype;FlipIterator.prototype=Object.create(____SuperProtoOfLazyIterable);FlipIterator.prototype.constructor=FlipIterator;FlipIterator.__superConstructor__=LazyIterable;
  function FlipIterator(iterator) {"use strict";
    this.iterator = iterator;
  }

  FlipIterator.prototype.iterate=function(fn) {"use strict";
    return this.iterator.iterate(function(v, k, c)  {return fn(k, v, c) !== false;});
  };


for(LazyIterable____Key in LazyIterable){if(LazyIterable.hasOwnProperty(LazyIterable____Key)){ValueIterator[LazyIterable____Key]=LazyIterable[LazyIterable____Key];}}ValueIterator.prototype=Object.create(____SuperProtoOfLazyIterable);ValueIterator.prototype.constructor=ValueIterator;ValueIterator.__superConstructor__=LazyIterable;
  function ValueIterator(iterator) {"use strict";
    this.iterator = iterator;
  }

  ValueIterator.prototype.iterate=function(fn) {"use strict";
    var iterations = 0;
    return this.iterator.iterate(function(v, k, c)  {return fn(v, iterations++, c) !== false;});
  };


for(LazyIterable____Key in LazyIterable){if(LazyIterable.hasOwnProperty(LazyIterable____Key)){MapIterator[LazyIterable____Key]=LazyIterable[LazyIterable____Key];}}MapIterator.prototype=Object.create(____SuperProtoOfLazyIterable);MapIterator.prototype.constructor=MapIterator;MapIterator.__superConstructor__=LazyIterable;
  function MapIterator(iterator, mapper, mapThisArg) {"use strict";
    this.iterator = iterator;
    this.mapper = mapper;
    this.mapThisArg = mapThisArg;
  }

  MapIterator.prototype.iterate=function(fn) {"use strict";
    var map = this.mapper;
    var mapThisArg = this.mapThisArg;
    return this.iterator.iterate(function(v, k, c) 
      {return fn(map.call(mapThisArg, v, k, c), k, c) !== false;}
    );
  };


for(LazyIterable____Key in LazyIterable){if(LazyIterable.hasOwnProperty(LazyIterable____Key)){FilterIterator[LazyIterable____Key]=LazyIterable[LazyIterable____Key];}}FilterIterator.prototype=Object.create(____SuperProtoOfLazyIterable);FilterIterator.prototype.constructor=FilterIterator;FilterIterator.__superConstructor__=LazyIterable;
  function FilterIterator(iterator, predicate, predicateThisArg) {"use strict";
    this.iterator = iterator;
    this.predicate = predicate;
    this.predicateThisArg = predicateThisArg;
  }

  FilterIterator.prototype.iterate=function(fn) {"use strict";
    var predicate = this.predicate;
    var predicateThisArg = this.predicateThisArg;
    return this.iterator.iterate(function(v, k, c) 
      {return !predicate.call(predicateThisArg, v, k, c) ||
      fn(v, k, c) !== false;}
    );
  };


module.exports = LazyIterable;
