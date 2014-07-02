var LazyIterable = require('./LazyIterable');

for(var LazyIterable____Key in LazyIterable){if(LazyIterable.hasOwnProperty(LazyIterable____Key)){ObjectIterator[LazyIterable____Key]=LazyIterable[LazyIterable____Key];}}var ____SuperProtoOfLazyIterable=LazyIterable===null?null:LazyIterable.prototype;ObjectIterator.prototype=Object.create(____SuperProtoOfLazyIterable);ObjectIterator.prototype.constructor=ObjectIterator;ObjectIterator.__superConstructor__=LazyIterable;
  function ObjectIterator(object) {"use strict";
    this.$ObjectIterator_object = object;
  }

  ObjectIterator.prototype.iterate=function(fn, thisArg) {"use strict";
    for (var key in this.$ObjectIterator_object) if (this.$ObjectIterator_object.hasOwnProperty(key)) {
      if (fn.call(thisArg, this.$ObjectIterator_object[key], key, this) === false) {
        return false;
      }
    }
    return true;
  };


module.exports = ObjectIterator;
