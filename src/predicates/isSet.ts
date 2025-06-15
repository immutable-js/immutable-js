import type { Set } from '../../type-definitions/immutable';

export const IS_SET_SYMBOL = '@@__IMMUTABLE_SET__@@';

/**
 * True if `maybeSet` is a Set.
 *
 * Also true for OrderedSets.
 */
export function isSet(maybeSet: unknown): maybeSet is Set<unknown> {
  return Boolean(
    maybeSet &&
      // @ts-expect-error: maybeSet is typed as `{}`,  need to change in 6.0 to `maybeSeq && typeof maybeSet === 'object' && MAYBE_SET_SYMBOL in maybeSet`
      maybeSet[IS_SET_SYMBOL]
  );
}
