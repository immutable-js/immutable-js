export const IS_ORDERED_SYMBOL = '@@__IMMUTABLE_ORDERED__@@';

export function isOrdered(maybeOrdered: unknown): boolean {
  return Boolean(
    maybeOrdered &&
      // @ts-expect-error: maybeOrdered is typed as `{}`, need to change in 6.0 to `maybeOrdered && typeof maybeOrdered === 'object' && IS_ORDERED_SYMBOL in maybeOrdered`
      maybeOrdered[IS_ORDERED_SYMBOL]
  );
}
