/**
 * Contributes additional methods to a constructor
 */
export default function mixin(ctor, methods) {
  const keyCopier = key => {
    ctor.prototype[key] = methods[key];
  };
  Object.keys(methods).forEach(keyCopier);
  Object.getOwnPropertySymbols &&
    Object.getOwnPropertySymbols(methods).forEach(keyCopier);
  return ctor;
}
