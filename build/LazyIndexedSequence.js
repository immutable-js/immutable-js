var LazySequence = require('./LazySequence');

for(var LazySequence____Key in LazySequence){if(LazySequence.hasOwnProperty(LazySequence____Key)){LazyIndexedSequence[LazySequence____Key]=LazySequence[LazySequence____Key];}}var ____SuperProtoOfLazySequence=LazySequence===null?null:LazySequence.prototype;LazyIndexedSequence.prototype=Object.create(____SuperProtoOfLazySequence);LazyIndexedSequence.prototype.constructor=LazyIndexedSequence;LazyIndexedSequence.__superConstructor__=LazySequence;function LazyIndexedSequence(){"use strict";if(LazySequence!==null){LazySequence.apply(this,arguments);}}
  LazyIndexedSequence.prototype.toArray=function() {"use strict";
    var array = [];
    this.__iterate(function(v, k)  { array[k] = v; });
    return array;
  };

  LazyIndexedSequence.prototype.toVector=function() {"use strict";
    // Use Late Binding here to solve the circular dependency.
    return require('./Vector').empty().merge(this);
  };

  LazyIndexedSequence.prototype.reverse=function(maintainIndices) {"use strict";
    return new ReverseIterator(this, maintainIndices);
  };

  LazyIndexedSequence.prototype.filter=function(predicate, context, maintainIndices) {"use strict";
    var seq = ____SuperProtoOfLazySequence.filter.call(this,predicate, context);
    return maintainIndices ? seq : seq.values();
  };

  LazyIndexedSequence.prototype.indexOf=function(searchValue) {"use strict";
    return this.findIndex(function(value)  {return value === searchValue;});
  };

  LazyIndexedSequence.prototype.lastIndexOf=function(searchValue) {"use strict";
    return this.reverse(true).indexOf(searchValue);
  };

  LazyIndexedSequence.prototype.findIndex=function(predicate, context) {"use strict";
    var key = this.findKey(predicate, context);
    return key == null ? -1 : key;
  };

  LazyIndexedSequence.prototype.findLastIndex=function(predicate, context) {"use strict";
    return this.reverse(true).findIndex(predicate, context);
  };

  LazyIndexedSequence.prototype.skip=function(amount, maintainIndices) {"use strict";
    var iterations = 0;
    return this.skipWhile(function()  {return iterations++ < amount;}, null, maintainIndices);
  };

  LazyIndexedSequence.prototype.skipWhile=function(predicate, context, maintainIndices) {"use strict";
    return this.__makeSequence(false, function(fn)  {
      var isSkipping = true;
      var indexOffset = 0;
      return function(v, i, c)  {
        if (isSkipping) {
          isSkipping = predicate.call(context, v, i, c);
          if (!maintainIndices && !isSkipping) {
            indexOffset = i;
          }
        }
        return isSkipping || fn(v, i - indexOffset, c) !== false;
      };
    });
  };

  LazyIndexedSequence.prototype.skipUntil=function(predicate, context, maintainIndices) {"use strict";
    return this.skipWhile(not(predicate), context, maintainIndices);
  };

  // __iterate(fn, reverseIndices)

  /**
   * Note: the default implementation of this needs to make an intermediate
   * representation which may be inefficent or at worse infinite.
   * Subclasses should do better if possible.
   */
  LazyIndexedSequence.prototype.__reverseIterate=function(fn, maintainIndices) {"use strict";
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

  LazyIndexedSequence.prototype.__makeSequence=function(withCommutativeReverse, factory) {"use strict";
    var sequence = this;
    var newSequence = Object.create(LazyIndexedSequence.prototype);
    newSequence.__iterate = function(fn, reverseIndices) 
      {return sequence.__iterate(factory(fn), reverseIndices);};
    if (withCommutativeReverse) {
      newSequence.__reverseIterate = function(fn, maintainIndices) 
        {return sequence.__reverseIterate(factory(fn), maintainIndices);};
    }
    return newSequence;
  };


for(var LazyIndexedSequence____Key in LazyIndexedSequence){if(LazyIndexedSequence.hasOwnProperty(LazyIndexedSequence____Key)){ReverseIterator[LazyIndexedSequence____Key]=LazyIndexedSequence[LazyIndexedSequence____Key];}}var ____SuperProtoOfLazyIndexedSequence=LazyIndexedSequence===null?null:LazyIndexedSequence.prototype;ReverseIterator.prototype=Object.create(____SuperProtoOfLazyIndexedSequence);ReverseIterator.prototype.constructor=ReverseIterator;ReverseIterator.__superConstructor__=LazyIndexedSequence;
  function ReverseIterator(iterator, maintainIndices) {"use strict";
    this.iterator = iterator;
    this.maintainIndices = maintainIndices;
  }

  ReverseIterator.prototype.reverse=function(maintainIndices) {"use strict";
    if (maintainIndices === this.maintainIndices) {
      return this.iterator;
    }
    return ____SuperProtoOfLazyIndexedSequence.reverse.call(this,maintainIndices);
  };

  ReverseIterator.prototype.__iterate=function(fn, reverseIndices) {"use strict";
    return this.iterator.__reverseIterate(fn, reverseIndices !== this.maintainIndices);
  };

  ReverseIterator.prototype.__reverseIterate=function(fn, maintainIndices) {"use strict";
    return this.iterator.__iterate(fn, maintainIndices !== this.maintainIndices);
  };


module.exports = LazyIndexedSequence;
