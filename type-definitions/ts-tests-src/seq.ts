// AUTO/SOURCE-PASS DUPLICATE of ../ts-tests/<same name>.
// Resolves `immutable` against the TS SOURCE (src/Immutable.js), to validate the
// types emitted by the migration. Tests are `.skip` until the underlying
// collection/method is migrated to TS; un-skip them as migration progresses.
// Some d.ts-only types (MapOf, RecordOf, DeepCopy) are omitted from imports
// until they exist in the source. See .agents/commands/migrate-to-ts.md.
// The source does not emit the public type names (`Seq.Indexed<T>`, …) yet, so
// the assertions reference the internal `*Impl` classes imported straight from
// the source; switch back to the public names once they exist.

import { Seq } from 'immutable';
import { expect, pick, test } from 'tstyche';
import type { IndexedSeqImpl, SeqImpl } from '../../src/Seq';

test('#constructor', () => {
  expect(Seq([1, 2, 3])).type.toBe<IndexedSeqImpl<number>>();
});

test('#size', () => {
  // The d.ts original asserts `readonly size`; the source's `size` is still
  // mutable (it is written internally by `ensureSize`/`cacheResult`). The
  // public readonly layer is part of the remaining migration work.
  expect(pick(Seq(), 'size')).type.toBe<{
    size: number | undefined;
  }>();
});

test('Set.Indexed concat', () => {
  const s: IndexedSeqImpl<number> = Seq([1]);
  expect(s).type.toBe<IndexedSeqImpl<number>>();
  expect(s.concat([4, 5, 6])).type.toBe<IndexedSeqImpl<number>>();
  expect(s.concat(Seq([4, 5, 6]))).type.toBe<IndexedSeqImpl<number>>();
});

// Stays skipped: the base `Seq` type has no `concat` yet — it lives in the
// not-yet-migrated mixin (CollectionImpl.js) and cannot be `declare`d on
// `SeqImpl` without breaking the structural `*SeqImpl` → `SeqImpl`
// assignability (see `KeyedSeqImpl.concat` in src/Seq.ts).
test.skip('Set concat', () => {
  const s: SeqImpl<unknown, unknown> = Seq([1]);
  expect(s).type.toBe<SeqImpl<unknown, unknown>>();
  expect(s.concat([4, 5, 6])).type.toBe<SeqImpl<unknown, unknown>>();
  expect(s.concat(Seq([4, 5, 6]))).type.toBe<SeqImpl<unknown, unknown>>();
});
