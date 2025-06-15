import type { OrderedSet } from '../../type-definitions/immutable';
import { isOrdered } from './isOrdered';
import { isSet } from './isSet';

/**
 * True if `maybeOrderedSet` is an OrderedSet.
 */
export function isOrderedSet(
  maybeOrderedSet: unknown
): maybeOrderedSet is OrderedSet<unknown> {
  return isSet(maybeOrderedSet) && isOrdered(maybeOrderedSet);
}
