import { expect, test } from 'tstyche';
import { Seq, Collection } from 'immutable';

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
