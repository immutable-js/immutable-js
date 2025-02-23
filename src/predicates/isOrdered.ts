export const IS_ORDERED_SYMBOL = '@@__IMMUTABLE_ORDERED__@@';

/**
 * True if `maybeOrdered` is a Collection where iteration order is well
 * defined. True for Collection.Indexed as well as OrderedMap and OrderedSet.
 *
 * ```js
 * import { isOrdered, Map, OrderedMap, List, Set } from 'immutable';
 *
 * isOrdered([]); // false
 * isOrdered({}); // false
 * isOrdered(Map()); // false
 * isOrdered(OrderedMap()); // true
 * isOrdered(List()); // true
 * isOrdered(Set()); // false
 * ```
 */
export function isOrdered(maybeOrdered: unknown): boolean {
  return Boolean(
    maybeOrdered &&
      // @ts-expect-error: maybeOrdered is typed as `{}`, need to change in 6.0 to `maybeOrdered && typeof maybeOrdered === 'object' && IS_ORDERED_SYMBOL in maybeOrdered`
      maybeOrdered[IS_ORDERED_SYMBOL]
  );
}
