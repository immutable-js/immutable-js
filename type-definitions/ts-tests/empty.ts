import {
  type CollectionImpl,
  type IndexedCollectionImpl,
  type KeyedCollectionImpl,
  type SetCollectionImpl,
  Collection,
  Seq,
} from 'immutable';
import { expect, test } from 'tstyche';

test('typed empty Seq', () => {
  expect(Seq()).type.toBe<Seq<unknown, unknown>>();

  expect(Seq<number, string>()).type.toBe<Seq<number, string>>();

  expect(Seq.Indexed()).type.toBe<Seq.Indexed<unknown>>();

  expect(Seq.Indexed<string>()).type.toBe<Seq.Indexed<string>>();

  expect(Seq.Keyed()).type.toBe<Seq.Keyed<unknown, unknown>>();

  expect(Seq.Keyed<number, string>()).type.toBe<Seq.Keyed<number, string>>();

  expect(Seq.Set()).type.toBe<Seq.Set<unknown>>();

  expect(Seq.Set<string>()).type.toBe<Seq.Set<string>>();
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
