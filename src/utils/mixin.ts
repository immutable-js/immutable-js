type Constructor<T = object> = new (...args: unknown[]) => T;

/**
 * Contributes additional methods to a constructor
 */
export default function mixin<I, C extends Constructor = Constructor>(
  ctor: C,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  methods: I
): C {
  const keyCopier = (key: string | symbol): void => {
    // @ts-expect-error how to handle symbol ?
    ctor.prototype[key] = methods[key];
  };
  // Use getOwnPropertyNames to copy non-enumerable properties (like TypeScript class methods)
  Object.getOwnPropertyNames(methods).forEach(keyCopier);
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO enable eslint here
  Object.getOwnPropertySymbols &&
    Object.getOwnPropertySymbols(methods).forEach(keyCopier);
  return ctor;
}
