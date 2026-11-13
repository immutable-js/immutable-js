import type { KeyPath } from '../../type-definitions/immutable';
import { NOT_SET } from '../TrieUtils';
import { updateIn } from './updateIn';

/**
 * Returns a copy of the collection with the value at the key path removed.
 *
 * A functional alternative to `collection.removeIn(keypath)` which will also
 * work with plain Objects and Arrays.
 */
export function removeIn<C>(collection: C, keyPath: KeyPath<unknown>): C {
  return updateIn(collection, keyPath, () => NOT_SET);
}
