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
  expect(List).type.toBe<typeof List>();

  expect(Map).type.toBe<typeof Map>();

  expect(OrderedMap).type.toBe<typeof OrderedMap>();

  expect(OrderedSet).type.toBe<typeof OrderedSet>();

  expect(Range).type.toBe<
    (
      start: number,
      end: number,
      step?: number | undefined
    ) => Seq.Indexed<number>
  >();

  expect(Repeat).type.toBe<
    <T>(value: T, times?: number | undefined) => Seq.Indexed<T>
  >();

  expect(Seq).type.toBe<typeof Seq>();

  expect(Set).type.toBe<typeof Set>();

  expect(Stack).type.toBe<typeof Stack>();

  expect(Collection).type.toBe<typeof Collection>();

  expect(Collection.Set).type.toBe<
    <T>(
      collection?: Iterable<T> | ArrayLike<T> | undefined
    ) => Collection.Set<T>
  >();

  expect(Collection.Keyed).type.toBe<{
    <K, V>(collection?: Iterable<[K, V]> | undefined): Collection.Keyed<K, V>;
    <V>(obj: { [key: string]: V }): Collection.Keyed<string, V>;
  }>();

  expect(Collection.Indexed).type.toBe<
    <T>(
      collection?: Iterable<T> | ArrayLike<T> | undefined
    ) => Collection.Indexed<T>
  >();
});

test('namespace import', () => {
  expect(Immutable.List).type.toBe<typeof Immutable.List>();

  expect(Immutable.Map).type.toBe<typeof Immutable.Map>();

  expect(Immutable.OrderedMap).type.toBe<typeof Immutable.OrderedMap>();

  expect(Immutable.OrderedSet).type.toBe<typeof Immutable.OrderedSet>();

  expect(Immutable.Range).type.toBe<
    (
      start: number,
      end: number,
      step?: number | undefined
    ) => Immutable.Seq.Indexed<number>
  >();

  expect(Immutable.Repeat).type.toBe<
    <T>(value: T, times?: number | undefined) => Immutable.Seq.Indexed<T>
  >();

  expect(Immutable.Seq).type.toBe<typeof Immutable.Seq>();

  expect(Immutable.Set).type.toBe<typeof Immutable.Set>();

  expect(Immutable.Stack).type.toBe<typeof Immutable.Stack>();

  expect(Immutable.Collection).type.toBe<typeof Immutable.Collection>();

  expect(Immutable.Collection.Set).type.toBe<
    <T>(
      collection?: Iterable<T> | ArrayLike<T> | undefined
    ) => Immutable.Collection.Set<T>
  >();

  expect(Immutable.Collection.Keyed).type.toBe<{
    <K, V>(
      collection?: Iterable<[K, V]> | undefined
    ): Immutable.Collection.Keyed<K, V>;
    <V>(obj: { [key: string]: V }): Immutable.Collection.Keyed<string, V>;
  }>();

  expect(Immutable.Collection.Indexed).type.toBe<
    <T>(
      collection?: Iterable<T> | ArrayLike<T> | undefined
    ) => Immutable.Collection.Indexed<T>
  >();
});
