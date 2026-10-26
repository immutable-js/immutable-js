// AUTO/SOURCE-PASS DUPLICATE of ../ts-tests/<same name>.
// Resolves `immutable` against the TS SOURCE (src/Immutable.js), to validate the
// types emitted by the migration. Tests are `.skip` until the underlying
// collection/method is migrated to TS; un-skip them as migration progresses.
// Some d.ts-only types (MapOf, RecordOf, DeepCopy) are omitted from imports
// until they exist in the source. See .agents/commands/migrate-to-ts.md.
// The source does not emit the public type names (`Seq.Keyed<K, V>`, …) yet, so
// the assertions reference the internal `*Impl` classes imported straight from
// the source; switch back to the public names once they exist.

import { Collection, Seq } from 'immutable';
import { expect, test } from 'tstyche';
import type {
  CollectionImpl,
  IndexedCollectionImpl,
  KeyedCollectionImpl,
  SetCollectionImpl,
} from '../../src/Collection';
import type {
  IndexedSeqImpl,
  KeyedSeqImpl,
  SeqImpl,
  SetSeqImpl,
} from '../../src/Seq';

test('typed empty Seq', () => {
  type Seq<K, V> = SeqImpl<K, V>;
  expect(Seq()).type.toBe<SeqImpl<unknown, unknown>>();

  expect(Seq<number, string>()).type.toBe<SeqImpl<number, string>>();

  expect(Seq.Indexed()).type.toBe<IndexedSeqImpl<unknown>>();

  expect(Seq.Indexed<string>()).type.toBe<IndexedSeqImpl<string>>();

  expect(Seq.Keyed()).type.toBe<KeyedSeqImpl<unknown, unknown>>();

  expect(Seq.Keyed<number, string>()).type.toBe<KeyedSeqImpl<number, string>>();

  expect(Seq.Set()).type.toBe<SetSeqImpl<unknown>>();

  expect(Seq.Set<string>()).type.toBe<SetSeqImpl<string>>();
});

test('typed empty Collection', () => {
  expect(Collection()).type.toBe<CollectionImpl<unknown, unknown>>();

  expect(Collection<number, string>()).type.toBe<
    CollectionImpl<number, string>
  >();

  expect(Collection.Indexed()).type.toBe<IndexedCollectionImpl<unknown>>();

  expect(Collection.Indexed<string>()).type.toBe<
    IndexedCollectionImpl<string>
  >();

  expect(Collection.Keyed()).type.toBe<KeyedCollectionImpl<unknown, unknown>>();

  expect(Collection.Keyed<number, string>()).type.toBe<
    KeyedCollectionImpl<number, string>
  >();

  expect(Collection.Set()).type.toBe<SetCollectionImpl<unknown>>();

  expect(Collection.Set<string>()).type.toBe<SetCollectionImpl<string>>();
});
