var LazySequence = require('./LazySequence');

for(var LazySequence____Key in LazySequence){if(LazySequence.hasOwnProperty(LazySequence____Key)){LazyIndexedSequence[LazySequence____Key]=LazySequence[LazySequence____Key];}}var ____SuperProtoOfLazySequence=LazySequence===null?null:LazySequence.prototype;LazyIndexedSequence.prototype=Object.create(____SuperProtoOfLazySequence);LazyIndexedSequence.prototype.constructor=LazyIndexedSequence;LazyIndexedSequence.__superConstructor__=LazySequence;function LazyIndexedSequence(){"use strict";if(LazySequence!==null){LazySequence.apply(this,arguments);}}
  // adds reverseIndices
  // abstract __iterate(fn, reverseIndices)

  // This adds maintainIndicies
  LazyIndexedSequence.prototype.__reverseIterate=function(fn, maintainIndices) {"use strict";
    /**
     * Note: the default implementation of this needs to make an intermediate
     * representation which may be inefficent or at worse infinite.
     * Subclasses should do better if possible.
     */
    var temp = [];
    var collection;
    this.__iterate(function(v, i, c)  {
      collection || (collection = c);
      temp[i] = v;
    });
    var maxIndex = temp.length - 1;
    for (var ii = maxIndex; ii >= 0; ii--) {
      if (temp.hasOwnProperty(ii) &&
          fn(temp[ii], maintainIndices ? ii : maxIndex - ii, collection) === false) {
        return false;
      }
    }
    return true;
  };

  // This is an override.
  LazyIndexedSequence.prototype.toArray=function() {"use strict";
    var array = [];
    this.__iterate(function(v, k)  { array[k] = v; });
    return array;
  };

  // This is an override.
  LazyIndexedSequence.prototype.toVector=function() {"use strict";
    // Use Late Binding here to solve the circular dependency.
    return require('./Vector').empty().merge(this);
  };

  // Overridden to add maintainIndices
  LazyIndexedSequence.prototype.reverse=function(maintainIndices) {"use strict";
    return new ReverseIterator(this, maintainIndices);
  };

  // This is an override that adds maintainIndicies to get similar behavior to Array.prototype.filter
  // TODO (and for the skips) how to ensure the return value is instanceof LazyIndexedSequence?
  LazyIndexedSequence.prototype.filter=function(predicate, context, maintainIndices) {"use strict";
    var seq = ____SuperProtoOfLazySequence.filter.call(this,predicate, context);
    return maintainIndices ? seq : seq.values();
  };

  // new method
  LazyIndexedSequence.prototype.indexOf=function(searchValue) {"use strict";
    return this.findIndex(function(value)  {return value === searchValue;});
  };

  // new method
  LazyIndexedSequence.prototype.lastIndexOf=function(searchValue) {"use strict";
    return this.reverse(true).indexOf(searchValue);
  };

  // new method
  LazyIndexedSequence.prototype.findIndex=function(predicate, context) {"use strict";
    var key = this.findKey(predicate, context);
    return key == null ? -1 : key;
  };

  // new method
  LazyIndexedSequence.prototype.findLastIndex=function(predicate, context) {"use strict";
    return this.reverse(true).findIndex(predicate, context);
  };

  // This override adds maintainIndicies
  LazyIndexedSequence.prototype.skip=function(amount, maintainIndices) {"use strict";
    var seq = ____SuperProtoOfLazySequence.skip.call(this,amount);
    return maintainIndices ? seq : seq.values();
  };

  LazyIndexedSequence.prototype.skipWhile=function(predicate, context, maintainIndices) {"use strict";
    // TODO: I think we actually want to provide something new here where we just subtract from indicies for skip.
    var seq = ____SuperProtoOfLazySequence.skipWhile.call(this,predicate, context);
    return maintainIndices ? seq : seq.values();
  };

  LazyIndexedSequence.prototype.skipUntil=function(predicate, context, maintainIndices) {"use strict";
    var seq = ____SuperProtoOfLazySequence.skipUntil.call(this,predicate, context);
    return maintainIndices ? seq : seq.values();
  };

  // Override ensures created sequences are Indexed.
  LazyIndexedSequence.prototype.__makeIterator=function(iterate, reverseIterate) {"use strict";
    var iterator = Object.create(LazyIndexedSequence.prototype);
    // TODO: this is a dupe of the superclass's implementation. Reduce.
    iterator.__iterate = iterate;
    reverseIterate && (iterator.__reverseIterate = reverseIterate);
    return iterator;
  };


for(var LazyIndexedSequence____Key in LazyIndexedSequence){if(LazyIndexedSequence.hasOwnProperty(LazyIndexedSequence____Key)){ReverseIterator[LazyIndexedSequence____Key]=LazyIndexedSequence[LazyIndexedSequence____Key];}}var ____SuperProtoOfLazyIndexedSequence=LazyIndexedSequence===null?null:LazyIndexedSequence.prototype;ReverseIterator.prototype=Object.create(____SuperProtoOfLazyIndexedSequence);ReverseIterator.prototype.constructor=ReverseIterator;ReverseIterator.__superConstructor__=LazyIndexedSequence;
  function ReverseIterator(iterator, maintainIndices) {"use strict";
    this.iterator = iterator;
    this.maintainIndices = maintainIndices;
  }

  ReverseIterator.prototype.__iterate=function(fn, reverseIndices) {"use strict";
    return this.iterator.__reverseIterate(fn, reverseIndices !== this.maintainIndices);
  };

  ReverseIterator.prototype.__reverseIterate=function(fn, maintainIndices) {"use strict";
    return this.iterator.__iterate(fn, maintainIndices !== this.maintainIndices);
  };

  ReverseIterator.prototype.reverse=function(maintainIndices) {"use strict";
    if (maintainIndices === this.maintainIndices) {
      return this.iterator;
    }
    return ____SuperProtoOfLazyIndexedSequence.reverse.call(this,maintainIndices);
  };


module.exports = LazyIndexedSequence;
