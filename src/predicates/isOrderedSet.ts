import { isSet } from './isSet';
import { isOrdered } from './isOrdered';
import type { OrderedSet } from '../../type-definitions/immutable';

export function isOrderedSet(
  maybeOrderedSet: unknown
): maybeOrderedSet is OrderedSet<unknown> {
  return isSet(maybeOrderedSet) && isOrdered(maybeOrderedSet);
}
