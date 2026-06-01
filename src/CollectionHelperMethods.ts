import type { CollectionImpl } from './Collection';
import assertNotInfinite from './utils/assertNotInfinite';

export function reduce<K, V, R, C extends CollectionImpl<K, V>>(
  collection: C,
  reducer: (reduction: V | R, value: V, key: K, iter: C) => R,
  reduction: V | R | undefined,
  context: unknown,
  useFirst: boolean,
  reverse: boolean
): V | R | undefined {
  assertNotInfinite(collection.size);
  collection.__iterate((v: V, k: K, c: C) => {
    if (useFirst) {
      useFirst = false;
      reduction = v;
    } else {
      // `reduction` has already been seeded here (either with the provided
      // initial value or with the first iterated value), so it is never the
      // `undefined` placeholder — only a `V` or a `R`.
      reduction = reducer.call(context, reduction!, v, k, c);
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
