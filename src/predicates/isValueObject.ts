import type { ValueObject } from '../../type-definitions/immutable';

export function isValueObject(maybeValue: unknown): maybeValue is ValueObject {
  return Boolean(
    maybeValue &&
      // @ts-expect-error: maybeValue is typed as `{}`
      typeof maybeValue.equals === 'function' &&
      // @ts-expect-error: maybeValue is typed as `{}`
      typeof maybeValue.hashCode === 'function'
  );
}
