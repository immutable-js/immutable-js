// AUTO/SOURCE-PASS DUPLICATE of ../ts-tests/<same name>.
// Resolves `immutable` against the TS SOURCE (src/Immutable.js), to validate the
// types emitted by the migration. Tests are `.skip` until the underlying
// collection/method is migrated to TS; un-skip them as migration progresses.
// Some d.ts-only types (MapOf, RecordOf, DeepCopy) are omitted from imports
// until they exist in the source. See .agents/commands/migrate-to-ts.md.

import { Collection, Seq } from 'immutable';
import { expect, test } from 'tstyche';

test.skip('typed empty Seq', () => {
  expect(Seq()).type.toBe<Seq<unknown, unknown>>();

  expect(Seq<number, string>()).type.toBe<Seq<number, string>>();

  expect(Seq.Indexed()).type.toBe<Seq.Indexed<unknown>>();

  expect(Seq.Indexed<string>()).type.toBe<Seq.Indexed<string>>();

  expect(Seq.Keyed()).type.toBe<Seq.Keyed<unknown, unknown>>();

  expect(Seq.Keyed<number, string>()).type.toBe<Seq.Keyed<number, string>>();

  expect(Seq.Set()).type.toBe<Seq.Set<unknown>>();

  expect(Seq.Set<string>()).type.toBe<Seq.Set<string>>();
});

test.skip('typed empty Collection', () => {
  expect(Collection()).type.toBe<Collection<unknown, unknown>>();

  expect(Collection<number, string>()).type.toBe<Collection<number, string>>();

  expect(Collection.Indexed()).type.toBe<Collection.Indexed<unknown>>();

  expect(Collection.Indexed<string>()).type.toBe<Collection.Indexed<string>>();

  expect(Collection.Keyed()).type.toBe<Collection.Keyed<unknown, unknown>>();

  expect(Collection.Keyed<number, string>()).type.toBe<
    Collection.Keyed<number, string>
  >();

  expect(Collection.Set()).type.toBe<Collection.Set<unknown>>();

  expect(Collection.Set<string>()).type.toBe<Collection.Set<string>>();
});
