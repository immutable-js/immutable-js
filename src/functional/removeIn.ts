import type { KeyPath } from '../../type-definitions/immutable';
import { NOT_SET } from '../const';
import { type PossibleCollection, updateIn } from './updateIn';

/**
 * Returns a copy of the collection with the value at the key path removed.
 *
 * A functional alternative to `collection.removeIn(keypath)` which will also
 * work with plain Objects and Arrays.
 */
export function removeIn<
  K extends PropertyKey,
  V,
  TProps extends object,
  C extends PossibleCollection<K, V, TProps>,
>(collection: C, keyPath: KeyPath<K>): C {
  return updateIn(collection, keyPath, () => NOT_SET);
}
