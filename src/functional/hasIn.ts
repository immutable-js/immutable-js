import type { KeyPath } from '../../type-definitions/immutable';
import { NOT_SET } from '../TrieUtils';
import { getIn } from './getIn';

/**
 * Returns true if the key path is defined in the provided collection.
 *
 * A functional alternative to `collection.hasIn(keypath)` which will also
 * work with plain Objects and Arrays.
 */
export function hasIn(
  collection: string | boolean | number,
  keyPath: KeyPath<unknown>
): never;
export function hasIn<K>(collection: unknown, keyPath: KeyPath<K>): boolean;
export function hasIn(collection: unknown, keyPath: KeyPath<unknown>): boolean {
  return getIn(collection, keyPath, NOT_SET) !== NOT_SET;
}
