var IndexedLazyIterable = require('./IndexedLazyIterable');

for(var IndexedLazyIterable____Key in IndexedLazyIterable){if(IndexedLazyIterable.hasOwnProperty(IndexedLazyIterable____Key)){ArrayIterator[IndexedLazyIterable____Key]=IndexedLazyIterable[IndexedLazyIterable____Key];}}var ____SuperProtoOfIndexedLazyIterable=IndexedLazyIterable===null?null:IndexedLazyIterable.prototype;ArrayIterator.prototype=Object.create(____SuperProtoOfIndexedLazyIterable);ArrayIterator.prototype.constructor=ArrayIterator;ArrayIterator.__superConstructor__=IndexedLazyIterable;
  function ArrayIterator(array) {"use strict";
    if (this instanceof ArrayIterator) {
      this.$ArrayIterator_array = array;
    } else {
      return new ArrayIterator(this.$ArrayIterator_object);
    }
  }

  ArrayIterator.prototype.iterate=function(fn, reverseIndices) {"use strict";
    var array = this.$ArrayIterator_array;
    var maxIndex = array.length - 1;
    return this.$ArrayIterator_array.every(function(value, index) 
      {return fn(value, reverseIndices ? maxIndex - index : index, array) !== false;}
    );
  };

  ArrayIterator.prototype.reverseIterate=function(fn, maintainIndices) {"use strict";
    var array = this.$ArrayIterator_array;
    var maxIndex = array.length - 1;
    for (var ii = maxIndex; ii >= 0; ii--) {
      if (array.hasOwnProperty(ii) &&
          fn(array[ii], maintainIndices ? ii : maxIndex - ii, array) === false) {
        return false;
      }
    }
    return true;
  };


module.exports = ArrayIterator;
