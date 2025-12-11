export const ITERATE_KEYS = 0;
export const ITERATE_VALUES = 1;
export const ITERATE_ENTRIES = 2;

export type IteratorType =
  | typeof ITERATE_KEYS
  | typeof ITERATE_VALUES
  | typeof ITERATE_ENTRIES;

export class Iterator<V> implements globalThis.Iterator<V, undefined> {
  static KEYS = ITERATE_KEYS;
  static VALUES = ITERATE_VALUES;
  static ENTRIES = ITERATE_ENTRIES;

  declare next: () => IteratorResult<V, undefined>;

  constructor(next: () => IteratorResult<V, undefined>) {
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
  v: undefined,
  iteratorResult?: IteratorYieldResult<K>
): IteratorYieldResult<V>;
export function iteratorValue<K, V>(
  type: IteratorType,
  k: K,
  v: V,
  iteratorResult?: IteratorYieldResult<V>
): IteratorYieldResult<V>;
export function iteratorValue<K, V>(
  type: typeof ITERATE_ENTRIES,
  k: K,
  v: V,
  iteratorResult?: IteratorYieldResult<[K, V]>
): IteratorYieldResult<[K, V]>;
export function iteratorValue<K, V>(
  type: IteratorType,
  k: K,
  v: V,
  iteratorResult?:
    | IteratorYieldResult<K>
    | IteratorYieldResult<V>
    | IteratorYieldResult<[K, V]>
): IteratorYieldResult<K | V | [K, V]> {
  const value = getValueFromType(type, k, v);
  // type === ITERATE_KEYS ? k : type === ITERATE_VALUES ? v : [k, v];

  if (iteratorResult) {
    iteratorResult.value = value;

    return iteratorResult;
  }

  return {
    value: value,
    done: false,
  };
}

function getValueFromType<K, V>(type: typeof ITERATE_KEYS, k: K, v: V): K;
function getValueFromType<K, V>(
  type: typeof ITERATE_VALUES,
  k: K,
  v: V
): V | undefined;
function getValueFromType<K, V>(
  type: typeof ITERATE_ENTRIES,
  k: K,
  v: V
): [K, V] | undefined;
function getValueFromType<K, V>(type: IteratorType, k: K, v: V): K | V | [K, V];
function getValueFromType<K, V>(
  type: IteratorType,
  k: K,
  v: V
): K | V | [K, V] {
  return type === ITERATE_KEYS ? k : type === ITERATE_VALUES ? v : [k, v];
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
