var OrderedLazyIterable = require('./OrderedLazyIterable');

for(var OrderedLazyIterable____Key in OrderedLazyIterable){if(OrderedLazyIterable.hasOwnProperty(OrderedLazyIterable____Key)){IndexedLazyIterable[OrderedLazyIterable____Key]=OrderedLazyIterable[OrderedLazyIterable____Key];}}var ____SuperProtoOfOrderedLazyIterable=OrderedLazyIterable===null?null:OrderedLazyIterable.prototype;IndexedLazyIterable.prototype=Object.create(____SuperProtoOfOrderedLazyIterable);IndexedLazyIterable.prototype.constructor=IndexedLazyIterable;IndexedLazyIterable.__superConstructor__=OrderedLazyIterable;function IndexedLazyIterable(){"use strict";if(OrderedLazyIterable!==null){OrderedLazyIterable.apply(this,arguments);}}
  // adds reverseIndices
  // abstract iterate(fn, reverseIndices)

  // This adds maintainIndicies
  IndexedLazyIterable.prototype.reverseIterate=function(fn, maintainIndices) {"use strict";
    /**
     * Note: the default implementation of this needs to make an intermediate
     * representation which may be inefficent or at worse infinite.
     * Subclasses should do better if possible.
     */
    var temp = [];
    var collection;
    this.iterate(function(v, i, c)  {
      collection || (collection = c);
      // TODO: note that this is why we're overriding (do we even need this?!)
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
  IndexedLazyIterable.prototype.toArray=function() {"use strict";
    var array = [];
    this.iterate(function(v, k)  { array[k] = v; });
    return array;
  };

  // This is an override.
  IndexedLazyIterable.prototype.toVector=function() {"use strict";
    // Use Late Binding here to solve the circular dependency.
    return require('./Vector').empty().merge(this);
  };

  // Overridden to add maintainIndices
  IndexedLazyIterable.prototype.reverse=function(maintainIndices) {"use strict";
    return new ReverseIterator(this, maintainIndices);
  };

  // This is an override that adds maintainIndicies to get similar behavior to Array.prototype.filter
  // TODO (and for the skips) how to ensure the return value is instanceof IndexedLazyIterable?
  IndexedLazyIterable.prototype.filter=function(predicate, context, maintainIndices) {"use strict";
    var seq = ____SuperProtoOfOrderedLazyIterable.filter.call(this,predicate, context);
    return maintainIndices ? seq : seq.values();
  };

  // new method
  IndexedLazyIterable.prototype.indexOf=function(searchValue) {"use strict";
    return this.findIndex(function(value)  {return value === searchValue;});
  };

  // new method
  IndexedLazyIterable.prototype.lastIndexOf=function(searchValue) {"use strict";
    return this.reverse(true).indexOf(searchValue);
  };

  // new method
  IndexedLazyIterable.prototype.findIndex=function(predicate, context) {"use strict";
    var key = this.findKey(predicate, context);
    return key == null ? -1 : key;
  };

  // new method
  IndexedLazyIterable.prototype.findLastIndex=function(predicate, context) {"use strict";
    return this.reverse(true).findIndex(predicate, context);
  };

  // This override adds maintainIndicies
  IndexedLazyIterable.prototype.skip=function(amount, maintainIndices) {"use strict";
    var seq = ____SuperProtoOfOrderedLazyIterable.skip.call(this,amount);
    return maintainIndices ? seq : seq.values();
  };

  IndexedLazyIterable.prototype.skipWhile=function(predicate, context, maintainIndices) {"use strict";
    var seq = ____SuperProtoOfOrderedLazyIterable.skipWhile.call(this,predicate, context);
    return maintainIndices ? seq : seq.values();
  };

  IndexedLazyIterable.prototype.skipUntil=function(predicate, context, maintainIndices) {"use strict";
    var seq = ____SuperProtoOfOrderedLazyIterable.skipUntil.call(this,predicate, context);
    return maintainIndices ? seq : seq.values();
  };

  // Override ensures created sequences are Indexed.
  IndexedLazyIterable.prototype.__makeIterator=function(iterate, reverseIterate) {"use strict";
    var iterator = Object.create(IndexedLazyIterable.prototype);
    // TODO: this is a dupe of the superclass's implementation. Reduce.
    iterator.iterate = iterate;
    reverseIterate && (iterator.reverseIterate = reverseIterate);
    return iterator;
  };


for(var IndexedLazyIterable____Key in IndexedLazyIterable){if(IndexedLazyIterable.hasOwnProperty(IndexedLazyIterable____Key)){ReverseIterator[IndexedLazyIterable____Key]=IndexedLazyIterable[IndexedLazyIterable____Key];}}var ____SuperProtoOfIndexedLazyIterable=IndexedLazyIterable===null?null:IndexedLazyIterable.prototype;ReverseIterator.prototype=Object.create(____SuperProtoOfIndexedLazyIterable);ReverseIterator.prototype.constructor=ReverseIterator;ReverseIterator.__superConstructor__=IndexedLazyIterable;
  function ReverseIterator(iterator, maintainIndices) {"use strict";
    this.iterator = iterator;
    this.maintainIndices = maintainIndices;
  }

  ReverseIterator.prototype.iterate=function(fn, reverseIndices) {"use strict";
    return this.iterator.reverseIterate(fn, reverseIndices !== this.maintainIndices);
  };

  ReverseIterator.prototype.reverseIterate=function(fn, maintainIndices) {"use strict";
    return this.iterator.iterate(fn, maintainIndices !== this.maintainIndices);
  };

  ReverseIterator.prototype.reverse=function(maintainIndices) {"use strict";
    if (maintainIndices === this.maintainIndices) {
      return this.iterator;
    }
    return ____SuperProtoOfIndexedLazyIterable.reverse.call(this,maintainIndices);
  };


module.exports = IndexedLazyIterable;
