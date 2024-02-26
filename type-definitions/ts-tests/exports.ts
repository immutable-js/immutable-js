// Some tests look like they are repeated in order to avoid false positives.

import { expect, test } from 'tstyche';
import * as Immutable from 'immutable';
import {
  List,
  Map,
  OrderedMap,
  OrderedSet,
  Range,
  Repeat,
  Seq,
  Set,
  Stack,
  Collection,
} from 'immutable';

test('named imports', () => {
  expect(List).type.toEqual<typeof List>();

  expect(Map).type.toEqual<typeof Map>();

  expect(OrderedMap).type.toEqual<typeof OrderedMap>();

  expect(OrderedSet).type.toEqual<typeof OrderedSet>();

  expect(Range).type.toEqual<
    (
      start: number,
      end: number,
      step?: number | undefined
    ) => Seq.Indexed<number>
  >();

  expect(Repeat).type.toEqual<
    <T>(value: T, times?: number | undefined) => Seq.Indexed<T>
  >();

  expect(Seq).type.toEqual<typeof Seq>();

  expect(Set).type.toEqual<typeof Set>();

  expect(Stack).type.toEqual<typeof Stack>();

  expect(Collection).type.toEqual<typeof Collection>();

  expect(Collection.Set).type.toEqual<
    <T>(
      collection?: Iterable<T> | ArrayLike<T> | undefined
    ) => Collection.Set<T>
  >();

  expect(Collection.Keyed).type.toEqual<{
    <K, V>(collection?: Iterable<[K, V]> | undefined): Collection.Keyed<K, V>;
    <V>(obj: { [key: string]: V }): Collection.Keyed<string, V>;
  }>();

  expect(Collection.Indexed).type.toEqual<
    <T>(
      collection?: Iterable<T> | ArrayLike<T> | undefined
    ) => Collection.Indexed<T>
  >();
});

test('namespace import', () => {
  expect(Immutable.List).type.toEqual<typeof Immutable.List>();

  expect(Immutable.Map).type.toEqual<typeof Immutable.Map>();

  expect(Immutable.OrderedMap).type.toEqual<typeof Immutable.OrderedMap>();

  expect(Immutable.OrderedSet).type.toEqual<typeof Immutable.OrderedSet>();

  expect(Immutable.Range).type.toEqual<
    (
      start: number,
      end: number,
      step?: number | undefined
    ) => Immutable.Seq.Indexed<number>
  >();

  expect(Immutable.Repeat).type.toEqual<
    <T>(value: T, times?: number | undefined) => Immutable.Seq.Indexed<T>
  >();

  expect(Immutable.Seq).type.toEqual<typeof Immutable.Seq>();

  expect(Immutable.Set).type.toEqual<typeof Immutable.Set>();

  expect(Immutable.Stack).type.toEqual<typeof Immutable.Stack>();

  expect(Immutable.Collection).type.toEqual<typeof Immutable.Collection>();

  expect(Immutable.Collection.Set).type.toEqual<
    <T>(
      collection?: Iterable<T> | ArrayLike<T> | undefined
    ) => Immutable.Collection.Set<T>
  >();

  expect(Immutable.Collection.Keyed).type.toEqual<{
    <K, V>(
      collection?: Iterable<[K, V]> | undefined
    ): Immutable.Collection.Keyed<K, V>;
    <V>(obj: { [key: string]: V }): Immutable.Collection.Keyed<string, V>;
  }>();

  expect(Immutable.Collection.Indexed).type.toEqual<
    <T>(
      collection?: Iterable<T> | ArrayLike<T> | undefined
    ) => Immutable.Collection.Indexed<T>
  >();
});
