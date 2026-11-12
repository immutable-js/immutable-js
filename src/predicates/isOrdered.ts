import type { OrderedCollection } from '../../type-definitions/immutable';

export const IS_ORDERED_SYMBOL = '@@__IMMUTABLE_ORDERED__@@';

// The runtime brand the guard actually tests; intersected into the narrowed
// type because the public `OrderedCollection` shape (toArray +
// Symbol.iterator) is structurally matched by every collection, so without
// the brand a negative `isOrdered` check would narrow plain collections to
// `never`.
type OrderedBrand = { [IS_ORDERED_SYMBOL]: true };

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
export function isOrdered<I>(
  maybeOrdered: Iterable<I>
): maybeOrdered is OrderedCollection<I> & OrderedBrand;
export function isOrdered(
  maybeOrdered: unknown
): maybeOrdered is OrderedCollection<unknown> & OrderedBrand;
export function isOrdered(
  maybeOrdered: unknown
): maybeOrdered is OrderedCollection<unknown> & OrderedBrand {
  return Boolean(
    maybeOrdered &&
      // @ts-expect-error: maybeOrdered is typed as `{}`, need to change in 6.0 to `maybeOrdered && typeof maybeOrdered === 'object' && IS_ORDERED_SYMBOL in maybeOrdered`
      maybeOrdered[IS_ORDERED_SYMBOL]
  );
}
