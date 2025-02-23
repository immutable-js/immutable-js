import type { List } from '../../type-definitions/immutable';

export const IS_LIST_SYMBOL = '@@__IMMUTABLE_LIST__@@';

/**
 * True if `maybeList` is a List.
 */
export function isList(maybeList: unknown): maybeList is List<unknown> {
  return Boolean(
    maybeList &&
      // @ts-expect-error: maybeList is typed as `{}`, need to change in 6.0 to `maybeList && typeof maybeList === 'object' && IS_LIST_SYMBOL in maybeList`
      maybeList[IS_LIST_SYMBOL]
  );
}
