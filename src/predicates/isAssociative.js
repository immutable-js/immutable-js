import { isKeyed } from './isKeyed';
import { isIndexed } from './isIndexed';

export function isAssociative(maybeAssociative) {
  return isKeyed(maybeAssociative) || isIndexed(maybeAssociative);
}
