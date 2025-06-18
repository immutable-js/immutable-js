export const ITERATE_KEYS = 0;
export const ITERATE_VALUES = 1;
export const ITERATE_ENTRIES = 2;

type IteratorType =
  | typeof ITERATE_KEYS
  | typeof ITERATE_VALUES
  | typeof ITERATE_ENTRIES;

export class Iterator<V> implements globalThis.Iterator<V> {
  static KEYS = ITERATE_KEYS;
  static VALUES = ITERATE_VALUES;
  static ENTRIES = ITERATE_ENTRIES;

  declare next: () => IteratorResult<V>;

  constructor(next: () => IteratorResult<V>) {
    if (next) {
      // Map extends Iterator and has a `next` method, do not erase it in that case. We could have checked `if (next && !this.next)` too.
      this.next = next;
    }
  }

  toString() {
    return '[Iterator]';
  }

  inspect(): string {
    return this.toString();
  }

  toSource(): string {
    return this.toString();
  }

  [Symbol.iterator]() {
    return this;
  }
}

export function iteratorValue<K, V>(
  type: IteratorType,
  k: K,
  v?: undefined,
  iteratorResult?: IteratorResult<K>
): IteratorResult<V> | undefined;
export function iteratorValue<K, V>(
  type: IteratorType,
  k: K,
  v: V,
  iteratorResult?: IteratorResult<V>
): IteratorResult<V> | undefined;
export function iteratorValue<K, V>(
  type: typeof ITERATE_ENTRIES,
  k: K,
  v?: V,
  iteratorResult?: IteratorResult<[K, V]>
): IteratorResult<[K, V]> | undefined;
export function iteratorValue<K, V>(
  type: IteratorType,
  k: K,
  v?: V,
  iteratorResult?:
    | IteratorResult<K>
    | IteratorResult<V>
    | IteratorResult<[K, V]>
): IteratorResult<K> | IteratorResult<V> | IteratorResult<[K, V]> | undefined {
  const value =
    type === ITERATE_KEYS ? k : type === ITERATE_VALUES ? v : [k, v];
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO enable eslint here
  iteratorResult
    ? (iteratorResult.value = value)
    : (iteratorResult = {
        // @ts-expect-error ensure value is not undefined
        value: value,
        done: false,
      });

  return iteratorResult;
}

export function iteratorDone(): IteratorReturnResult<undefined> {
  return { value: undefined, done: true };
}

export function hasIterator(
  maybeIterable: unknown
): maybeIterable is Iterable<unknown> {
  if (Array.isArray(maybeIterable)) {
    // IE11 trick as it does not support `Symbol.iterator`
    return true;
  }

  return !!getIteratorFn(maybeIterable);
}

export function isIterator(
  maybeIterator: unknown
): maybeIterator is Iterator<unknown> {
  return !!(
    maybeIterator &&
    // @ts-expect-error: maybeIterator is typed as `{}`
    typeof maybeIterator.next === 'function'
  );
}

export function getIterator(iterable: unknown): Iterator<unknown> | undefined {
  const iteratorFn = getIteratorFn(iterable);
  return iteratorFn && iteratorFn.call(iterable);
}

function getIteratorFn(
  iterable: unknown
): (() => Iterator<unknown>) | undefined {
  const iteratorFn =
    iterable &&
    // @ts-expect-error: maybeIterator is typed as `{}`
    iterable[Symbol.iterator];
  if (typeof iteratorFn === 'function') {
    return iteratorFn;
  }
}

export function isEntriesIterable(
  maybeIterable: unknown
): maybeIterable is Iterable<[unknown, unknown]> {
  const iteratorFn = getIteratorFn(maybeIterable);
  // @ts-expect-error: maybeIterator is typed as `{}`
  return iteratorFn && iteratorFn === maybeIterable.entries;
}

export function isKeysIterable(
  maybeIterable: unknown
): maybeIterable is Iterable<unknown> {
  const iteratorFn = getIteratorFn(maybeIterable);
  // @ts-expect-error: maybeIterator is typed as `{}`
  return iteratorFn && iteratorFn === maybeIterable.keys;
}
