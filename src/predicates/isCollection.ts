import type { Collection } from '../../type-definitions/immutable';

// Note: value is unchanged to not break immutable-devtools.
export const IS_COLLECTION_SYMBOL = '@@__IMMUTABLE_ITERABLE__@@';

export function isCollection(
  maybeCollection: unknown
): maybeCollection is Collection<unknown, unknown> {
  return Boolean(
    maybeCollection &&
      // @ts-expect-error: maybeCollection is typed as `{}`, need to change in 6.0 to `maybeCollection && typeof maybeCollection === 'object' && IS_COLLECTION_SYMBOL in maybeCollection`
      maybeCollection[IS_COLLECTION_SYMBOL]
  );
}
