export default function isArrayLike(
  value: unknown
): value is ArrayLike<unknown> {
  if (Array.isArray(value) || typeof value === 'string') {
    return true;
  }

  // @ts-expect-error "Type 'unknown' is not assignable to type 'boolean'" : convert to Boolean
  return (
    value &&
    typeof value === 'object' &&
    // @ts-expect-error check that `'length' in value &&`
    Number.isInteger(value.length) &&
    // @ts-expect-error check that `'length' in value &&`
    value.length >= 0 &&
    // @ts-expect-error check that `'length' in value &&`
    (value.length === 0
      ? // Only {length: 0} is considered Array-like.
        Object.keys(value).length === 1
      : // An object is only Array-like if it has a property where the last value
        // in the array-like may be found (which could be undefined).
        // @ts-expect-error check that `'length' in value &&`
        value.hasOwnProperty(value.length - 1))
  );
}
