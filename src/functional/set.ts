import type { Collection, Record } from '../../type-definitions/immutable';
import { isImmutable } from '../predicates/isImmutable';
import hasOwnProperty from '../utils/hasOwnProperty';
import isDataStructure from '../utils/isDataStructure';
import shallowCopy from '../utils/shallowCopy';

/**
 * Returns a copy of the collection with the value at key set to the provided
 * value.
 *
 * A functional alternative to `collection.set(key, value)` which will also
 * work with plain Objects and Arrays as an alternative for
 * `collectionCopy[key] = value`.
 */
export function set<K, V, C extends Collection<K, V>>(
  collection: C,
  key: K,
  value: V
): C;
export function set<
  TProps extends object,
  C extends Record<TProps>,
  K extends keyof TProps,
>(record: C, key: K, value: TProps[K]): C;
export function set<V, C extends Array<V>>(
  collection: C,
  key: number,
  value: V
): C;
export function set<C, K extends keyof C>(object: C, key: K, value: C[K]): C;
export function set<V, C extends { [key: string]: V }>(
  collection: C,
  key: string,
  value: V
): C;
export function set<K, V, C extends Collection<K, V> | { [key: string]: V }>(
  collection: C,
  key: K | string,
  value: V
): C {
  if (!isDataStructure(collection)) {
    throw new TypeError(
      'Cannot update non-data-structure value: ' + collection
    );
  }
  if (isImmutable(collection)) {
    // @ts-expect-error weird "set" here,
    if (!collection.set) {
      throw new TypeError(
        'Cannot update immutable value without .set() method: ' + collection
      );
    }
    // @ts-expect-error weird "set" here,
    return collection.set(key, value);
  }
  // @ts-expect-error mix of key and string here. Probably need a more fine type here
  if (hasOwnProperty.call(collection, key) && value === collection[key]) {
    return collection;
  }
  const collectionCopy = shallowCopy(collection);
  // @ts-expect-error mix of key and string here. Probably need a more fine type here
  collectionCopy[key] = value;
  return collectionCopy;
}
