import type { KeyedCollectionImpl } from '../Collection';

export const IS_KEYED_SYMBOL = '@@__IMMUTABLE_KEYED__@@';

/**
 * True if `maybeKeyed` is a Collection.Keyed, or any of its subclasses.
 *
 * ```js
 * import { isKeyed, Map, List, Stack } from 'immutable';
 *
 * isKeyed([]); // false
 * isKeyed({}); // false
 * isKeyed(Map()); // true
 * isKeyed(List()); // false
 * isKeyed(Stack()); // false
 * ```
 */
export function isKeyed(
  maybeKeyed: unknown
): maybeKeyed is KeyedCollectionImpl<unknown, unknown> {
  return Boolean(
    maybeKeyed &&
    typeof maybeKeyed === 'object' &&
    IS_KEYED_SYMBOL in maybeKeyed
  )
}
