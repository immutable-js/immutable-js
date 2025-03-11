import { isImmutable } from '../predicates/isImmutable';
import hasOwnProperty from '../utils/hasOwnProperty';
import isDataStructure from '../utils/isDataStructure';

/**
 * Returns true if the key is defined in the provided collection.
 *
 * A functional alternative to `collection.has(key)` which will also work with
 * plain Objects and Arrays as an alternative for
 * `collection.hasOwnProperty(key)`.
 *
 * <!-- runkit:activate -->
 * ```js
 * import { has } from 'immutable';
 *
 * has([ 'dog', 'frog', 'cat' ], 2) // true
 * has([ 'dog', 'frog', 'cat' ], 5) // false
 * has({ x: 123, y: 456 }, 'x') // true
 * has({ x: 123, y: 456 }, 'z') // false
 * ```
 */
export function has(collection: object, key: unknown): boolean {
  return isImmutable(collection)
    ? // @ts-expect-error key might be a number or symbol, which is not handled be Record key type
      collection.has(key)
    : // @ts-expect-error key might be anything else than PropertyKey, and will return false in that case but runtime is OK
      isDataStructure(collection) && hasOwnProperty.call(collection, key);
}
