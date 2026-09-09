import type { Record } from '../../type-definitions/immutable';
import type { CollectionImpl } from '../Collection';
import { isImmutable } from '../predicates/isImmutable';
import hasOwnProperty from '../utils/hasOwnProperty';
import isDataStructure from '../utils/isDataStructure';
import shallowCopy from '../utils/shallowCopy';

/**
 * Returns a copy of the collection with the value at key removed.
 *
 * A functional alternative to `collection.remove(key)` which will also work
 * with plain Objects and Arrays as an alternative for
 * `delete collectionCopy[key]`.
 */
export function remove<K, C extends CollectionImpl<K, unknown>>(
  collection: C,
  key: K
): C;
export function remove<
  TProps extends object,
  C extends Record<TProps>,
  K extends keyof TProps,
>(collection: C, key: K): C;
export function remove<C extends Array<unknown>>(collection: C, key: number): C;
export function remove<C, K extends keyof C>(collection: C, key: K): C;
export function remove<
  C extends { [key: PropertyKey]: unknown },
  K extends keyof C,
>(collection: C, key: K): C;
export function remove<
  K,
  C extends
    | CollectionImpl<K, unknown>
    | Array<unknown>
    | { [key: PropertyKey]: unknown },
>(collection: C, key: K): C;
export function remove<K>(
  collection:
    | CollectionImpl<K, unknown>
    | Array<unknown>
    | { [key: PropertyKey]: unknown },
  key: K
) {
  if (!isDataStructure(collection)) {
    throw new TypeError(
      'Cannot update non-data-structure value: ' + collection
    );
  }
  if (isImmutable(collection)) {
    // @ts-expect-error weird "remove" here,
    if (!collection.remove) {
      throw new TypeError(
        'Cannot update immutable value without .remove() method: ' + collection
      );
    }
    // @ts-expect-error weird "remove" here,
    return collection.remove(key);
  }
  // @ts-expect-error assert that key is a string, a number or a symbol here
  if (!hasOwnProperty.call(collection, key)) {
    return collection;
  }
  const collectionCopy = shallowCopy(collection);
  if (Array.isArray(collectionCopy)) {
    // @ts-expect-error assert that key is a number here
    collectionCopy.splice(key, 1);
  } else {
    // @ts-expect-error assert that key is a string, a number or a symbol here
    delete collectionCopy[key];
  }
  return collectionCopy;
}
