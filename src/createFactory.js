var _inherits = function(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }
  subClass.prototype = Object.create(superClass.prototype)
  subClass.prototype.constructor = subClass
  if (superClass) subClass.__proto__ = superClass;
}

export function createFactory(namedFn, ImmutableClass) {
  if (arguments.length === 1) {
    return createFactory(function ImmutableFactory() {
      ImmutableClass.apply(this, arguments)
    }, ImmutableClass)
  }
  var EMPTY_VALUE;
  function Surrogate(value) {
    if (!EMPTY_VALUE) {
      EMPTY_VALUE = Surrogate.__Class.prototype.__empty();
      Surrogate.__Class.prototype.__empty = function() {
        return EMPTY_VALUE;
      }
    }
    if (value === null || value === undefined) {
      return EMPTY_VALUE
    }
    if (ImmutableClass.__check(value)) {
      if (value.constructor === Surrogate || value.constructor === Surrogate.__Class) {
        return value;
      }
      return EMPTY_VALUE.merge(value.toSeq());
    }
    return Surrogate.__Class.__factory(value, EMPTY_VALUE)
  }
  _inherits(Surrogate, ImmutableClass)
  Surrogate.factory = Surrogate
  Surrogate.__Class = namedFn
  _inherits(Surrogate.__Class, Surrogate)
  return Surrogate;
}