export const IS_SEQ_SYMBOL = '@@__IMMUTABLE_SEQ__@@';

export function isSeq(maybeSeq) {
  return Boolean(maybeSeq && maybeSeq[IS_SEQ_SYMBOL]);
}
