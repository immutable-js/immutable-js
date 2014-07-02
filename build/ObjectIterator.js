var OrderedLazyIterable = require('./OrderedLazyIterable');

for(var OrderedLazyIterable____Key in OrderedLazyIterable){if(OrderedLazyIterable.hasOwnProperty(OrderedLazyIterable____Key)){ObjectIterator[OrderedLazyIterable____Key]=OrderedLazyIterable[OrderedLazyIterable____Key];}}var ____SuperProtoOfOrderedLazyIterable=OrderedLazyIterable===null?null:OrderedLazyIterable.prototype;ObjectIterator.prototype=Object.create(____SuperProtoOfOrderedLazyIterable);ObjectIterator.prototype.constructor=ObjectIterator;ObjectIterator.__superConstructor__=OrderedLazyIterable;
  function ObjectIterator(object) {"use strict";
    if (this instanceof ObjectIterator) {
      this.$ObjectIterator_object = object;
    } else {
      return new ObjectIterator(this.$ObjectIterator_object);
    }
  }

  // TODO: add efficient reverse iteration

  ObjectIterator.prototype.iterate=function(fn) {"use strict";
    for (var key in this.$ObjectIterator_object) if (this.$ObjectIterator_object.hasOwnProperty(key)) {
      if (fn(this.$ObjectIterator_object[key], key, this) === false) {
        return false;
      }
    }
    return true;
  };


module.exports = ObjectIterator;
