import type { Record } from '../../type-definitions/immutable';
import type { CollectionImpl } from '../Collection';
import { isCollection } from './isCollection';
import { isRecord } from './isRecord';

/**
 * True if `maybeImmutable` is an Immutable Collection or Record.
 *
 * Note: Still returns true even if the collections is within a `withMutations()`.
 *
 * ```js
 * import { isImmutable, Map, List, Stack } from 'immutable';
 * isImmutable([]); // false
 * isImmutable({}); // false
 * isImmutable(Map()); // true
 * isImmutable(List()); // true
 * isImmutable(Stack()); // true
 * isImmutable(Map().asMutable()); // true
 * ```
 */
export function isImmutable(
  maybeImmutable: unknown
): maybeImmutable is CollectionImpl<unknown, unknown> | Record<object> {
  return isCollection(maybeImmutable) || isRecord(maybeImmutable);
}
