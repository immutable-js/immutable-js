import { isSet } from './isSet';
import { isOrdered } from './isOrdered';
import type { OrderedSet } from '../../type-definitions/immutable';

/**
 * True if `maybeOrderedSet` is an OrderedSet.
 */
export function isOrderedSet(
  maybeOrderedSet: unknown
): maybeOrderedSet is OrderedSet<unknown> {
  return isSet(maybeOrderedSet) && isOrdered(maybeOrderedSet);
}
