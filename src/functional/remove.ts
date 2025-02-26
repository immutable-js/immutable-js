import type { Collection, Record } from '../../type-definitions/immutable';
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
 *
 * <!-- runkit:activate -->
 * ```js
 * import { remove } from 'immutable';
 *
 * const originalArray = [ 'dog', 'frog', 'cat' ]
 * remove(originalArray, 1) // [ 'dog', 'cat' ]
 * console.log(originalArray) // [ 'dog', 'frog', 'cat' ]
 * const originalObject = { x: 123, y: 456 }
 * remove(originalObject, 'x') // { y: 456 }
 * console.log(originalObject) // { x: 123, y: 456 }
 * ```
 */
export function remove<K, C extends Collection<K, unknown>>(
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
export function remove<K extends PropertyKey>(
  collection:
    | Collection<K, unknown>
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
  if (!hasOwnProperty.call(collection, key)) {
    return collection;
  }
  const collectionCopy = shallowCopy(collection);
  if (Array.isArray(collectionCopy)) {
    // @ts-expect-error assert that key is a number here
    collectionCopy.splice(key, 1);
  } else {
    delete collectionCopy[key];
  }
  return collectionCopy;
}
