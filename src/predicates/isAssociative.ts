import { isKeyed } from './isKeyed';
import { isIndexed } from './isIndexed';
import type { Collection } from '../../type-definitions/immutable';

export function isAssociative(
  maybeAssociative: unknown
): maybeAssociative is
  | Collection.Keyed<unknown, unknown>
  | Collection.Indexed<unknown> {
  return isKeyed(maybeAssociative) || isIndexed(maybeAssociative);
}
