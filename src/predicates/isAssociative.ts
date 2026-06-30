import type { IndexedCollectionImpl, KeyedCollectionImpl } from '../Collection';
import { isIndexed } from './isIndexed';
import { isKeyed } from './isKeyed';

/**
 * True if `maybeAssociative` is either a Keyed or Indexed Collection.
 *
 * ```js
 * import { isAssociative, Map, List, Stack, Set } from 'immutable';
 *
 * isAssociative([]); // false
 * isAssociative({}); // false
 * isAssociative(Map()); // true
 * isAssociative(List()); // true
 * isAssociative(Stack()); // true
 * isAssociative(Set()); // false
 * ```
 */
export function isAssociative<K, V>(
  maybeAssociative: unknown
): maybeAssociative is KeyedCollectionImpl<K, V> | IndexedCollectionImpl<V> {
  return isKeyed<K, V>(maybeAssociative) || isIndexed<V>(maybeAssociative);
}
