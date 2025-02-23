import type { Record } from '../../type-definitions/immutable';

export const IS_RECORD_SYMBOL = '@@__IMMUTABLE_RECORD__@@';

export function isRecord(maybeRecord: unknown): maybeRecord is Record<object> {
  return Boolean(
    maybeRecord &&
      // @ts-expect-error: maybeRecord is typed as `{}`, need to change in 6.0 to `maybeRecord && typeof maybeRecord === 'object' && IS_RECORD_SYMBOL in maybeRecord`
      maybeRecord[IS_RECORD_SYMBOL]
  );
}
