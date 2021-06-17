export const IS_KEYED_SYMBOL = '@@__IMMUTABLE_KEYED__@@';

export function isKeyed(maybeKeyed) {
  return Boolean(maybeKeyed && maybeKeyed[IS_KEYED_SYMBOL]);
}
