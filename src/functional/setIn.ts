import type { KeyPath } from '../../type-definitions/immutable';
import { NOT_SET } from '../TrieUtils';
import { updateIn } from './updateIn';

/**
 * Returns a copy of the collection with the value at the key path set to the
 * provided value.
 *
 * A functional alternative to `collection.setIn(keypath)` which will also
 * work with plain Objects and Arrays.
 */
export function setIn<C>(
  collection: C,
  keyPath: KeyPath<unknown>,
  value: unknown
): C {
  return updateIn(collection, keyPath, NOT_SET, () => value);
}
