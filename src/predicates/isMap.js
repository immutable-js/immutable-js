export const IS_MAP_SYMBOL = '@@__IMMUTABLE_MAP__@@';

export function isMap(maybeMap) {
  return Boolean(maybeMap && maybeMap[IS_MAP_SYMBOL]);
}
