import type { KeyPath } from '../../type-definitions/immutable';
import { NOT_SET } from '../TrieUtils';
import { type PossibleCollection, updateIn } from './updateIn';

/**
 * Returns a copy of the collection with the value at the key path set to the
 * provided value.
 *
 * A functional alternative to `collection.setIn(keypath)` which will also
 * work with plain Objects and Arrays.
 */
export function setIn<
  K extends PropertyKey,
  V,
  TProps extends object,
  C extends PossibleCollection<K, V, TProps>,
>(collection: C, keyPath: KeyPath<K>, value: unknown): C {
  return updateIn(collection, keyPath, NOT_SET, () => value);
}
