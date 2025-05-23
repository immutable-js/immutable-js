import type { Collection, Record } from '../../type-definitions/immutable';
import { updateIn, type PossibleCollection } from './updateIn';

type UpdaterFunction<V> = (value: V | undefined) => V | undefined;
type UpdaterFunctionWithNSV<V, NSV> = (value: V | NSV) => V;

/**
 * Returns a copy of the collection with the value at key set to the result of
 * providing the existing value to the updating function.
 *
 * A functional alternative to `collection.update(key, fn)` which will also
 * work with plain Objects and Arrays as an alternative for
 * `collectionCopy[key] = fn(collection[key])`.
 */
export function update<K, V, C extends Collection<K, V>>(
  collection: C,
  key: K,
  updater: (value: V | undefined) => V | undefined
): C;
export function update<K, V, C extends Collection<K, V>, NSV>(
  collection: C,
  key: K,
  notSetValue: NSV,
  updater: (value: V | NSV) => V
): C;
export function update<
  TProps extends object,
  C extends Record<TProps>,
  K extends keyof TProps,
>(record: C, key: K, updater: (value: TProps[K]) => TProps[K]): C;
export function update<
  TProps extends object,
  C extends Record<TProps>,
  K extends keyof TProps,
  NSV,
>(
  record: C,
  key: K,
  notSetValue: NSV,
  updater: (value: TProps[K] | NSV) => TProps[K]
): C;
export function update<V, C extends Array<V>>(
  collection: C,
  key: number,
  updater: UpdaterFunction<V>
): C;
export function update<V, C extends Array<V>, NSV>(
  collection: C,
  key: number,
  notSetValue: NSV,
  updater: (value: V | NSV) => V
): C;
export function update<C, K extends keyof C>(
  object: C,
  key: K,
  updater: (value: C[K]) => C[K]
): C;
export function update<C, K extends keyof C, NSV>(
  object: C,
  key: K,
  notSetValue: NSV,
  updater: (value: C[K] | NSV) => C[K]
): C;
export function update<V, C extends { [key: string]: V }, K extends keyof C>(
  collection: C,
  key: K,
  updater: (value: V) => V
): { [key: string]: V };
export function update<
  V,
  C extends { [key: string]: V },
  K extends keyof C,
  NSV,
>(
  collection: C,
  key: K,
  notSetValue: NSV,
  updater: (value: V | NSV) => V
): { [key: string]: V };

export function update<
  K,
  V,
  TProps extends object,
  C extends PossibleCollection<K, V, TProps>,
  NSV,
>(
  collection: C,
  key: K,
  notSetValue: NSV | UpdaterFunction<V>,
  updater?: UpdaterFunctionWithNSV<V, NSV>
) {
  return updateIn(
    // @ts-expect-error Index signature for type string is missing in type V[]
    collection,
    [key],
    notSetValue,
    updater
  );
}
