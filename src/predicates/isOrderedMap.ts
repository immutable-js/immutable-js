import type { OrderedMap } from '../../type-definitions/immutable';
import { isMap } from './isMap';
import { isOrdered } from './isOrdered';

export function isOrderedMap(
  maybeOrderedMap: unknown
): maybeOrderedMap is OrderedMap<unknown, unknown> {
  return isMap(maybeOrderedMap) && isOrdered(maybeOrderedMap);
}
