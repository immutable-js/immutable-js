import type { Map } from '../../type-definitions/immutable';

export const IS_MAP_SYMBOL = '@@__IMMUTABLE_MAP__@@';

/**
 * True if `maybeMap` is a Map.
 *
 * Also true for OrderedMaps.
 */
export function isMap(maybeMap: unknown): maybeMap is Map<unknown, unknown> {
  return Boolean(
    maybeMap &&
      // @ts-expect-error: maybeMap is typed as `{}`, need to change in 6.0 to `maybeMap && typeof maybeMap === 'object' && IS_MAP_SYMBOL in maybeMap`
      maybeMap[IS_MAP_SYMBOL]
  );
}
