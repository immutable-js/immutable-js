import { isMap } from './isMap';
import { isOrdered } from './isOrdered';

export function isOrderedMap(maybeOrderedMap) {
  return isMap(maybeOrderedMap) && isOrdered(maybeOrderedMap);
}
