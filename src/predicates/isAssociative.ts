import { isKeyed } from './isKeyed';
import { isIndexed } from './isIndexed';
import type { Collection } from '../../type-definitions/immutable';

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
export function isAssociative(
  maybeAssociative: unknown
): maybeAssociative is
  | Collection.Keyed<unknown, unknown>
  | Collection.Indexed<unknown> {
  return isKeyed(maybeAssociative) || isIndexed(maybeAssociative);
}
