import type { Collection } from '../../type-definitions/immutable';

export const IS_INDEXED_SYMBOL = '@@__IMMUTABLE_INDEXED__@@';

/**
 * True if `maybeIndexed` is a Collection.Indexed, or any of its subclasses.
 *
 * ```js
 * import { isIndexed, Map, List, Stack, Set } from 'immutable';
 *
 * isIndexed([]); // false
 * isIndexed({}); // false
 * isIndexed(Map()); // false
 * isIndexed(List()); // true
 * isIndexed(Stack()); // true
 * isIndexed(Set()); // false
 * ```
 */
export function isIndexed(
  maybeIndexed: unknown
): maybeIndexed is Collection.Indexed<unknown> {
  return Boolean(
    maybeIndexed &&
      // @ts-expect-error: maybeIndexed is typed as `{}`, need to change in 6.0 to `maybeIndexed && typeof maybeIndexed === 'object' && IS_INDEXED_SYMBOL in maybeIndexed`
      maybeIndexed[IS_INDEXED_SYMBOL]
  );
}
