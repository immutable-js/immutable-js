var OrderedLazyIterable = require('./OrderedLazyIterable');

for(var OrderedLazyIterable____Key in OrderedLazyIterable){if(OrderedLazyIterable.hasOwnProperty(OrderedLazyIterable____Key)){ArrayIterator[OrderedLazyIterable____Key]=OrderedLazyIterable[OrderedLazyIterable____Key];}}var ____SuperProtoOfOrderedLazyIterable=OrderedLazyIterable===null?null:OrderedLazyIterable.prototype;ArrayIterator.prototype=Object.create(____SuperProtoOfOrderedLazyIterable);ArrayIterator.prototype.constructor=ArrayIterator;ArrayIterator.__superConstructor__=OrderedLazyIterable;
  function ArrayIterator(array) {"use strict";
    this.$ArrayIterator_array = array;
  }

  ArrayIterator.prototype.iterate=function(fn, thisArg, reverseIndices) {"use strict";
    var array = this.$ArrayIterator_array;
    return this.$ArrayIterator_array.every(function(value, index) 
      {return fn.call(thisArg, value, reverseIndices ? array.length - 1 - index : index, array) !== false;}
    );
  };

  ArrayIterator.prototype.reverseIterate=function(fn, thisArg, maintainIndices) {"use strict";
    var array = this.$ArrayIterator_array;
    for (var ii = array.length - 1; ii >= 0; ii--) {
      if (array.hasOwnProperty(ii) &&
          fn.call(thisArg, array[ii], maintainIndices ? ii : array.length - 1 - ii, array) === false) {
        return false;
      }
    }
    return true;
  };


module.exports = ArrayIterator;
