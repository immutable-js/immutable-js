function LazyIterable(){"use strict";}
  // abstract iterate(fn)

  // toArray() {
  //   var array = [];
  //   this.iterate(v => { array.push(v); });
  //   return array;
  // }

  // toObject() {
  //   var object = {};
  //   this.iterate((v, k) => { object[k] = v; });
  //   return object;
  // }

  // toVector() {
  //   // Use Late Binding here to solve the circular dependency.
  //   var vect = require('./Vector').empty().asTransient();
  //   this.iterate(v => { vect.push(v); });
  //   return vect.asPersistent();
  // }

  // toMap() {
  //   // Use Late Binding here to solve the circular dependency.
  //   return require('./Map').empty().merge(this);
  // }

  // toSet() {
  //   // Use Late Binding here to solve the circular dependency.
  //   return require('./Set').empty().merge(this);
  // }

  // keys() {
  //   return this.map((v, k) => k).values();
  // }

  // values() {
  //   return new ValueIterator(this);
  // }

  // entries() {
  //   return this.map((v, k) => [k, v]).values();
  // }

  // forEach(fn, thisArg) {
  //   this.iterate((v, k, c) => { fn.call(thisArg, v, k, c); });
  // }

  // find(fn, thisArg) {
  //   var foundValue;
  //   this.iterate((v, k, c) => {
  //     if (fn.call(thisArg, v, k, c)) {
  //       foundValue = v;
  //       return false;
  //     }
  //   });
  //   return foundValue;
  // }

  // findKey(fn, thisArg) {
  //   var foundKey;
  //   this.iterate((v, k, c) => {
  //     if (fn.call(thisArg, v, k, c)) {
  //       foundKey = k;
  //       return false;
  //     }
  //   });
  //   return foundKey;
  // }

  // reduce(fn, initialReduction, thisArg) {
  //   var reduction = initialReduction;
  //   this.iterate((v, k, c) => {
  //     reduction = fn.call(thisArg, reduction, v, k, c);
  //   });
  //   return reduction;
  // }

  // flip() {
  //   return new FlipIterator(this);
  // }

  LazyIterable.prototype.map=function(fn, thisArg) {"use strict";
    return new MapIterator(this, fn, thisArg);
  };

  LazyIterable.prototype.filter=function(fn, thisArg) {"use strict";
    return new FilterIterator(this, fn, thisArg);
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
