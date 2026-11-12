import type ValueObject from '../ValueObject';

/**
 * True if `maybeValue` is a JavaScript Object which has *both* `equals()`
 * and `hashCode()` methods.
 *
 * Any two instances of *value objects* can be compared for value equality with
 * `Immutable.is()` and can be used as keys in a `Map` or members in a `Set`.
 */
export function isValueObject(maybeValue: unknown): maybeValue is ValueObject {
  return Boolean(
    maybeValue &&
      // @ts-expect-error: maybeValue is typed as `{}`
      typeof maybeValue.equals === 'function' &&
      // @ts-expect-error: maybeValue is typed as `{}`
      typeof maybeValue.hashCode === 'function'
  );
}
