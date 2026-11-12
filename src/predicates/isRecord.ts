import type {
  Primitive,
  Record,
  UnknownRecord,
} from '../../type-definitions/immutable';

export const IS_RECORD_SYMBOL = '@@__IMMUTABLE_RECORD__@@';

/**
 * True if `maybeRecord` is a Record.
 */
// `Record<any>`, the only Record every Record is assignable to: the guard narrows `RecordOf<T> | T`
export function isRecord(
  maybeRecord: object | Primitive
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): maybeRecord is Record<any>;
export function isRecord(maybeRecord: unknown): maybeRecord is UnknownRecord;
export function isRecord(maybeRecord: unknown): boolean {
  return Boolean(
    maybeRecord &&
      // @ts-expect-error: maybeRecord is typed as `{}`, need to change in 6.0 to `maybeRecord && typeof maybeRecord === 'object' && IS_RECORD_SYMBOL in maybeRecord`
      maybeRecord[IS_RECORD_SYMBOL]
  );
}
