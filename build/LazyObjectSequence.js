var LazySequence = require('./LazySequence');

for(var LazySequence____Key in LazySequence){if(LazySequence.hasOwnProperty(LazySequence____Key)){LazyObjectSequence[LazySequence____Key]=LazySequence[LazySequence____Key];}}var ____SuperProtoOfLazySequence=LazySequence===null?null:LazySequence.prototype;LazyObjectSequence.prototype=Object.create(____SuperProtoOfLazySequence);LazyObjectSequence.prototype.constructor=LazyObjectSequence;LazyObjectSequence.__superConstructor__=LazySequence;
  function LazyObjectSequence(object) {"use strict";
    if (this instanceof LazyObjectSequence) {
      this.$LazyObjectSequence_object = object;
    } else {
      return new LazyObjectSequence(this.$LazyObjectSequence_object);
    }
  }

  // TODO: add efficient reverse iteration

  LazyObjectSequence.prototype.__iterate=function(fn) {"use strict";
    for (var key in this.$LazyObjectSequence_object) if (this.$LazyObjectSequence_object.hasOwnProperty(key)) {
      if (fn(this.$LazyObjectSequence_object[key], key, this) === false) {
        return false;
      }
    }
    return true;
  };


module.exports = LazyObjectSequence;
