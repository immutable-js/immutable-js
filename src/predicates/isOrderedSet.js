import { isSet } from './isSet';
import { isOrdered } from './isOrdered';

export function isOrderedSet(maybeOrderedSet) {
  return isSet(maybeOrderedSet) && isOrdered(maybeOrderedSet);
}
