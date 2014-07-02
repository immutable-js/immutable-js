var LazyIndexedSequence = require('./LazyIndexedSequence');

for(var LazyIndexedSequence____Key in LazyIndexedSequence){if(LazyIndexedSequence.hasOwnProperty(LazyIndexedSequence____Key)){LazyArraySequence[LazyIndexedSequence____Key]=LazyIndexedSequence[LazyIndexedSequence____Key];}}var ____SuperProtoOfLazyIndexedSequence=LazyIndexedSequence===null?null:LazyIndexedSequence.prototype;LazyArraySequence.prototype=Object.create(____SuperProtoOfLazyIndexedSequence);LazyArraySequence.prototype.constructor=LazyArraySequence;LazyArraySequence.__superConstructor__=LazyIndexedSequence;
  function LazyArraySequence(array) {"use strict";
    if (this instanceof LazyArraySequence) {
      this.$LazyArraySequence_array = array;
    } else {
      return new LazyArraySequence(this.$LazyArraySequence_object);
    }
  }

  LazyArraySequence.prototype.__iterate=function(fn, reverseIndices) {"use strict";
    var array = this.$LazyArraySequence_array;
    var maxIndex = array.length - 1;
    return this.$LazyArraySequence_array.every(function(value, index) 
      {return fn(value, reverseIndices ? maxIndex - index : index, array) !== false;}
    );
  };

  LazyArraySequence.prototype.__reverseIterate=function(fn, maintainIndices) {"use strict";
    var array = this.$LazyArraySequence_array;
    var maxIndex = array.length - 1;
    for (var ii = maxIndex; ii >= 0; ii--) {
      if (array.hasOwnProperty(ii) &&
          fn(array[ii], maintainIndices ? ii : maxIndex - ii, array) === false) {
        return false;
      }
    }
    return true;
  };


module.exports = LazyArraySequence;
