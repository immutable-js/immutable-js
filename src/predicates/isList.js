export const IS_LIST_SYMBOL = '@@__IMMUTABLE_LIST__@@';

export function isList(maybeList) {
  return Boolean(maybeList && maybeList[IS_LIST_SYMBOL]);
}
