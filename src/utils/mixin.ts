type Constructor<T = object> = new (...args: unknown[]) => T;

/**
 * Contributes additional methods to a constructor
 */
export default function mixin<C extends Constructor>(
  ctor: C,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  methods: Record<string, Function>
): C {
  const keyCopier = (key: string | symbol): void => {
    // @ts-expect-error how to handle symbol ?
    ctor.prototype[key] = methods[key];
  };
  Object.keys(methods).forEach(keyCopier);
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO enable eslint here
  Object.getOwnPropertySymbols &&
    Object.getOwnPropertySymbols(methods).forEach(keyCopier);
  return ctor;
}
