import type { Collection } from '../type-definitions/immutable';
import assertNotInfinite from './utils/assertNotInfinite';

export function reduce(
  collection: Collection<unknown, unknown>,
  reducer: (...args: unknown[]) => unknown,
  reduction: unknown,
  context: unknown,
  useFirst: boolean,
  reverse: boolean
) {
  // @ts-expect-error Migrate to CollectionImpl in v6
  assertNotInfinite(collection.size);
  // @ts-expect-error Migrate to CollectionImpl in v6
  collection.__iterate((v, k, c) => {
    if (useFirst) {
      useFirst = false;
      reduction = v;
    } else {
      reduction = reducer.call(context, reduction, v, k, c);
    }
  }, reverse);
  return reduction;
}

export function keyMapper<K, V>(v: V, k: K): K {
  return k;
}

export function entryMapper<K, V>(v: V, k: K): [K, V] {
  return [k, v];
}

export function not(predicate: (...args: unknown[]) => boolean) {
  return function (this: unknown, ...args: unknown[]): boolean {
    return !predicate.apply(this, args);
  };
}

export function neg(predicate: (...args: unknown[]) => number) {
  return function (this: unknown, ...args: unknown[]): number {
    return -predicate.apply(this, args);
  };
}

export function defaultNegComparator(
  a: number | string,
  b: number | string
): number {
  return a < b ? 1 : a > b ? -1 : 0;
}
