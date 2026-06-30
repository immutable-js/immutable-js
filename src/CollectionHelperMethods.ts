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

export function not<Args extends unknown[]>(
  predicate: (...args: Args) => boolean
): (...args: Args) => boolean {
  return function (this: unknown, ...args: Args): boolean {
    return !predicate.apply(this, args);
  };
}

export function neg<Args extends unknown[]>(
  predicate: (...args: Args) => number
): (...args: Args) => number {
  return function (this: unknown, ...args: Args): number {
    return -predicate.apply(this, args);
  };
}

// The default comparator for `min`/`minBy`, which are valid on `Collection<K, V>`
// so this must accept any value (hence `unknown`, assignable as a `Comparator<V>`
// for any `V`). Unlike `defaultComparator`, an `undefined` operand returns 0 —
// not ±1 — so `maxFactory`'s nullish handling selects it rather than placing it
// last. `?? 0` maps `null` to 0 (as JS `<`/`>` coercion would) and yields a
// comparable type, avoiding an `as` cast.
export function defaultNegComparator(a: unknown, b: unknown): number {
  if (a === undefined || b === undefined) {
    return 0;
  }

  const x = a ?? 0;
  const y = b ?? 0;

  return x < y ? 1 : x > y ? -1 : 0;
}
