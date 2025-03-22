import { updateIn, type PossibleCollection } from './updateIn';
import { NOT_SET } from '../TrieUtils';
import type { KeyPath } from '../../type-definitions/immutable';

/**
 * Returns a copy of the collection with the value at the key path removed.
 *
 * A functional alternative to `collection.removeIn(keypath)` which will also
 * work with plain Objects and Arrays.
 *
 * <!-- runkit:activate -->
 * ```js
 * import { removeIn } from 'immutable';
 *
 * const original = { x: { y: { z: 123 }}}
 * removeIn(original, ['x', 'y', 'z']) // { x: { y: {}}}
 * console.log(original) // { x: { y: { z: 123 }}}
 * ```
 */
export function removeIn<
  K extends PropertyKey,
  V,
  TProps extends object,
  C extends PossibleCollection<K, V, TProps>,
>(collection: C, keyPath: KeyPath<K>): C {
  return updateIn(collection, keyPath, () => NOT_SET);
}
