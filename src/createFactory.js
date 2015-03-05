
import mixin from './utils/mixin'

function keyCopier(Target, Source) {
  return function(key) { Target[key] = Source[key] }
}

export function createFactory(ImmutableClass) {
  var EMPTY_VALUE;
  
  function Surrogate(value) {
    if (!EMPTY_VALUE) {
      EMPTY_VALUE = Surrogate.Class.prototype.__empty();
      Surrogate.Class.prototype.__empty = function() {
        return EMPTY_VALUE;
      }
    }
    if (value === null || value === undefined) {
      return EMPTY_VALUE
    }
    if (ImmutableClass.__check(value)) {
      if (value.constructor === Surrogate || value.constructor === Surrogate.Class) {
        return value;
      }
      return EMPTY_VALUE.merge(value);
    }
    return Surrogate.Class.__factory(value, EMPTY_VALUE)
  }
  Surrogate.prototype = Object.create(ImmutableClass.prototype)
  Surrogate.prototype.constructor = Surrogate
  mixin(Surrogate, ImmutableClass, keyCopier(Surrogate, ImmutableClass))
  Surrogate.Class = function() {
    ImmutableClass.apply(this, arguments)
  }
  Surrogate.factory = Surrogate
  Surrogate.Class.prototype = Object.create(Surrogate.prototype)
  Surrogate.Class.constructor = Surrogate.Class
  mixin(Surrogate.Class, ImmutableClass, keyCopier(Surrogate.Class, ImmutableClass))
  return Surrogate;
}