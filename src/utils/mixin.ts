type Constructor<T = object> = new (...args: unknown[]) => T;

/**
 * Contributes additional methods to a constructor
 */
export default function mixin<C extends Constructor>(
  ctor: C,
  methods: Record<PropertyKey, (...args: unknown[]) => unknown>
): C {
  const keyCopier = (key: string | symbol): void => {
    ctor.prototype[key] = methods[key];
  };
  Object.keys(methods).forEach(keyCopier);
  Object.getOwnPropertySymbols(methods).forEach(keyCopier);
  return ctor;
}
