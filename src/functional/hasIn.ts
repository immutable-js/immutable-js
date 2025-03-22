import { getIn } from './getIn';
import { NOT_SET } from '../TrieUtils';

type GetInParameters = Parameters<typeof getIn>;

/**
 * Returns true if the key path is defined in the provided collection.
 *
 * A functional alternative to `collection.hasIn(keypath)` which will also
 * work with plain Objects and Arrays.
 *
 * <!-- runkit:activate -->
 * ```js
 * import { hasIn } from 'immutable';
 *
 * hasIn({ x: { y: { z: 123 }}}, ['x', 'y', 'z']) // true
 * hasIn({ x: { y: { z: 123 }}}, ['x', 'q', 'p']) // false
 * ```
 */
export function hasIn(
  collection: GetInParameters[0],
  keyPath: GetInParameters[1]
): boolean {
  return getIn(collection, keyPath, NOT_SET) !== NOT_SET;
}
