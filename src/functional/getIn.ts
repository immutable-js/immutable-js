import coerceKeyPath from '../utils/coerceKeyPath';
import { NOT_SET } from '../TrieUtils';
import { get } from './get';
import type { KeyPath } from '../../type-definitions/immutable';

type GetType = typeof get;
type GetTypeParameters = Parameters<GetType>;
type CollectionType = GetTypeParameters[0];
type Key = GetTypeParameters[1];

/**
 * Returns the value at the provided key path starting at the provided
 * collection, or notSetValue if the key path is not defined.
 *
 * A functional alternative to `collection.getIn(keypath)` which will also
 * work with plain Objects and Arrays.
 *
 * <!-- runkit:activate -->
 * ```js
 * import { getIn } from 'immutable';
 *
 * getIn({ x: { y: { z: 123 }}}, ['x', 'y', 'z']) // 123
 * getIn({ x: { y: { z: 123 }}}, ['x', 'q', 'p'], 'ifNotSet') // 'ifNotSet'
 * ```
 */
export function getIn(
  collection: CollectionType,
  searchKeyPath: KeyPath<Key>,
  notSetValue?: GetTypeParameters[2]
): ReturnType<GetType> {
  const keyPath = coerceKeyPath(searchKeyPath);
  let i = 0;
  while (i !== keyPath.length) {
    // @ts-expect-error keyPath[i++] can not be undefined by design
    collection = get(collection, keyPath[i++], NOT_SET);
    if (collection === NOT_SET) {
      return notSetValue;
    }
  }
  return collection;
}
