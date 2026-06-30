// AUTO/SOURCE-PASS DUPLICATE of ../ts-tests/<same name>.
// Resolves `immutable` against the TS SOURCE (src/Immutable.js), to validate the
// types emitted by the migration. Tests are `.skip` until the underlying
// collection/method is migrated to TS; un-skip them as migration progresses.
// Some d.ts-only types (MapOf, RecordOf, DeepCopy) are omitted from imports
// until they exist in the source. See .agents/commands/migrate-to-ts.md.

import { Seq } from 'immutable';
import { expect, pick, test } from 'tstyche';

test.skip('#constructor', () => {
  expect(Seq([1, 2, 3])).type.toBe<Seq.Indexed<number>>();
});

test.skip('#size', () => {
  expect(pick(Seq(), 'size')).type.toBe<{
    readonly size: number | undefined;
  }>();
});

test.skip('Set.Indexed concat', () => {
  const s: Seq.Indexed<number> = Seq([1]);
  expect(s).type.toBe<Seq.Indexed<number>>();
  expect(s.concat([4, 5, 6])).type.toBe<Seq.Indexed<number>>();
  expect(s.concat(Seq([4, 5, 6]))).type.toBe<Seq.Indexed<number>>();
});

test.skip('Set concat', () => {
  const s: Seq<unknown, unknown> = Seq([1]);
  expect(s).type.toBe<Seq<unknown, unknown>>();
  expect(s.concat([4, 5, 6])).type.toBe<Seq<unknown, unknown>>();
  expect(s.concat(Seq([4, 5, 6]))).type.toBe<Seq<unknown, unknown>>();
});
