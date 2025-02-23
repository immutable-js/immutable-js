import type { Collection } from '../../type-definitions/immutable';

export const IS_INDEXED_SYMBOL = '@@__IMMUTABLE_INDEXED__@@';

export function isIndexed(
  maybeIndexed: unknown
): maybeIndexed is Collection.Indexed<unknown> {
  return Boolean(
    maybeIndexed &&
      // @ts-expect-error: maybeIndexed is typed as `{}`, need to change in 6.0 to `maybeIndexed && typeof maybeIndexed === 'object' && IS_INDEXED_SYMBOL in maybeIndexed`
      maybeIndexed[IS_INDEXED_SYMBOL]
  );
}
