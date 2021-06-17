export const IS_RECORD_SYMBOL = '@@__IMMUTABLE_RECORD__@@';

export function isRecord(maybeRecord) {
  return Boolean(maybeRecord && maybeRecord[IS_RECORD_SYMBOL]);
}
