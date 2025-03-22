import { updateIn, type PossibleCollection } from './updateIn';
import { NOT_SET } from '../TrieUtils';
import type { KeyPath } from '../../type-definitions/immutable';

/**
 * Returns a copy of the collection with the value at the key path set to the
 * provided value.
 *
 * A functional alternative to `collection.setIn(keypath)` which will also
 * work with plain Objects and Arrays.
 *
 * <!-- runkit:activate -->
 * ```js
 * import { setIn } from 'immutable';
 *
 * const original = { x: { y: { z: 123 }}}
 * setIn(original, ['x', 'y', 'z'], 456) // { x: { y: { z: 456 }}}
 * console.log(original) // { x: { y: { z: 123 }}}
 * ```
 */
export function setIn<
  K extends PropertyKey,
  V,
  TProps extends object,
  C extends PossibleCollection<K, V, TProps>,
>(collection: C, keyPath: KeyPath<K>, value: unknown): C {
  return updateIn(collection, keyPath, NOT_SET, () => value);
}
