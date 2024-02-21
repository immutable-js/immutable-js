import { expect, test } from 'tstyche';
import { Seq, Collection } from 'immutable';

test('typed empty Seq', () => {
  expect(Seq()).type.toEqual<Seq<unknown, unknown>>();

  expect(Seq<number, string>()).type.toEqual<Seq<number, string>>();

  expect(Seq.Indexed()).type.toEqual<Seq.Indexed<unknown>>();

  expect(Seq.Indexed<string>()).type.toEqual<Seq.Indexed<string>>();

  expect(Seq.Keyed()).type.toEqual<Seq.Keyed<unknown, unknown>>();

  expect(Seq.Keyed<number, string>()).type.toEqual<Seq.Keyed<number, string>>();

  expect(Seq.Set()).type.toEqual<Seq.Set<unknown>>();

  expect(Seq.Set<string>()).type.toEqual<Seq.Set<string>>();
});

test('typed empty Collection', () => {
  expect(Collection()).type.toEqual<Collection<unknown, unknown>>();

  expect(Collection<number, string>()).type.toEqual<
    Collection<number, string>
  >();

  expect(Collection.Indexed()).type.toEqual<Collection.Indexed<unknown>>();

  expect(Collection.Indexed<string>()).type.toEqual<
    Collection.Indexed<string>
  >();

  expect(Collection.Keyed()).type.toEqual<Collection.Keyed<unknown, unknown>>();

  expect(Collection.Keyed<number, string>()).type.toEqual<
    Collection.Keyed<number, string>
  >();

  expect(Collection.Set()).type.toEqual<Collection.Set<unknown>>();

  expect(Collection.Set<string>()).type.toEqual<Collection.Set<string>>();
});
