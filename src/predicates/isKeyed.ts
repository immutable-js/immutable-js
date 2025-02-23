import type { Collection } from '../../type-definitions/immutable';

export const IS_KEYED_SYMBOL = '@@__IMMUTABLE_KEYED__@@';

export function isKeyed(
  maybeKeyed: unknown
): maybeKeyed is Collection.Keyed<unknown, unknown> {
  return Boolean(
    maybeKeyed &&
      // @ts-expect-error: maybeKeyed is typed as `{}`, need to change in 6.0 to `maybeKeyed && typeof maybeKeyed === 'object' && IS_KEYED_SYMBOL in maybeKeyed`
      maybeKeyed[IS_KEYED_SYMBOL]
  );
}
