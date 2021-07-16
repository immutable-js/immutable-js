export const IS_SET_SYMBOL = '@@__IMMUTABLE_SET__@@';

export function isSet(maybeSet) {
  return Boolean(maybeSet && maybeSet[IS_SET_SYMBOL]);
}
