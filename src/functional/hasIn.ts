import { NOT_SET } from '../TrieUtils';
import { getIn } from './getIn';

type GetInParameters = Parameters<typeof getIn>;

/**
 * Returns true if the key path is defined in the provided collection.
 *
 * A functional alternative to `collection.hasIn(keypath)` which will also
 * work with plain Objects and Arrays.
 */
export function hasIn(
  collection: GetInParameters[0],
  keyPath: GetInParameters[1]
): boolean {
  return getIn(collection, keyPath, NOT_SET) !== NOT_SET;
}
