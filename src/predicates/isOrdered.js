export const IS_ORDERED_SYMBOL = '@@__IMMUTABLE_ORDERED__@@';

export function isOrdered(maybeOrdered) {
  return Boolean(maybeOrdered && maybeOrdered[IS_ORDERED_SYMBOL]);
}
