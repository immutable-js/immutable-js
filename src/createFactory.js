
function extend(Target, Source) {
  var keyCopier = (key) => { Target[key] = Source[key] }
  Object.keys(Source).forEach(keyCopier);
  Object.getOwnPropertySymbols &&
    Object.getOwnPropertySymbols(Source).forEach(keyCopier);
  return Source;
}

export function createFactory(ImmutableClass) {
  var emptyValue = ImmutableClass.prototype.__empty()
  if (!emptyValue || emptyValue.constructor !== ImmutableClass) {
    throw new Error('A distinct __empty method must be defined for the extended Immutable class.')
  }
  function factory(value) {
    return ImmutableClass.factory(value)
  }
  factory.prototype = Object.create(ImmutableClass.prototype)
  factory.prototype.constructor = factory;
  extend(factory, ImmutableClass)
  return factory;
}