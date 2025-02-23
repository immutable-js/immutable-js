import type { Seq } from '../../type-definitions/immutable';

export const IS_SEQ_SYMBOL = '@@__IMMUTABLE_SEQ__@@';

export function isSeq(
  maybeSeq: unknown
): maybeSeq is
  | Seq.Indexed<unknown>
  | Seq.Keyed<unknown, unknown>
  | Seq.Set<unknown> {
  return Boolean(
    maybeSeq &&
      // @ts-expect-error: maybeSeq is typed as `{}`, need to change in 6.0 to `maybeSeq && typeof maybeSeq === 'object' && MAYBE_SEQ_SYMBOL in maybeSeq`
      maybeSeq[IS_SEQ_SYMBOL]
  );
}
