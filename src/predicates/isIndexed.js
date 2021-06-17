export const IS_INDEXED_SYMBOL = '@@__IMMUTABLE_INDEXED__@@';

export function isIndexed(maybeIndexed) {
  return Boolean(maybeIndexed && maybeIndexed[IS_INDEXED_SYMBOL]);
}
