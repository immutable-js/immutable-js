import createClass from './utils/createClass'

export function createFactory(namedFnOrClass, ImmutableClass) {
  if (arguments.length === 1) {
    return createFactory(function ImmutableFactory() {
      namedFnOrClass.apply(this, arguments)
    }, namedFnOrClass)
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
      if (value.constructor === Surrogate.__Class) {
        return value;
      }
      return EMPTY_VALUE.merge(value.toSeq());
    }
    return Surrogate.__Class.__factory(value, EMPTY_VALUE)
  }
  createClass(Surrogate, ImmutableClass)
  Surrogate.__factoryDispatch = Surrogate
  Surrogate.__Class = namedFnOrClass
  createClass(Surrogate.__Class, Surrogate)
  return Surrogate;
}