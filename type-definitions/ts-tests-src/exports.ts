// AUTO/SOURCE-PASS DUPLICATE of ../ts-tests/<same name>.
// Resolves `immutable` against the TS SOURCE (src/Immutable.js), to validate the
// types emitted by the migration. Tests are `.skip` until the underlying
// collection/method is migrated to TS; un-skip them as migration progresses.
// Some d.ts-only types (MapOf, RecordOf, DeepCopy) are omitted from imports
// until they exist in the source. See .agents/commands/migrate-to-ts.md.
// The source does not emit the public type names (`Collection.Keyed<K, V>`, …)
// yet, so the live assertions reference the internal `*Impl` classes imported
// straight from the source; switch back to the public names once they exist.

// Some tests look like they are repeated in order to avoid false positives.

import * as Immutable from 'immutable';
import {
  Collection,
  List,
  Map,
  OrderedMap,
  OrderedSet,
  Range,
  Repeat,
  Seq,
  Set,
  Stack,
} from 'immutable';
import { expect, test } from 'tstyche';
import type {
  IndexedCollectionImpl,
  KeyedCollectionImpl,
  SetCollectionImpl,
} from '../../src/Collection';
import type { RangeImpl } from '../../src/Range';

test('named imports', () => {
  expect.skip(List).type.toBe<typeof List>();

  expect.skip(Map).type.toBe<typeof Map>();

  expect.skip(OrderedMap).type.toBe<typeof OrderedMap>();

  expect.skip(OrderedSet).type.toBe<typeof OrderedSet>();

  expect(Range).type.toBe<
    (start: number, end: number, step?: number | undefined) => RangeImpl
  >();

  expect
    .skip(Repeat)
    .type.toBe<<T>(value: T, times?: number | undefined) => Seq.Indexed<T>>();

  expect(Seq).type.toBe<typeof Seq>();

  expect.skip(Set).type.toBe<typeof Set>();

  expect.skip(Stack).type.toBe<typeof Stack>();

  expect(Collection).type.toBe<typeof Collection>();

  expect(Collection.Set).type.toBe<
    <T>(
      collection?: Iterable<T> | ArrayLike<T> | undefined
    ) => SetCollectionImpl<T>
  >();

  expect(Collection.Keyed).type.toBe<{
    <K, V>(
      collection?: Iterable<[K, V]> | undefined
    ): KeyedCollectionImpl<K, V>;
    <V>(obj: { [key: string]: V }): KeyedCollectionImpl<string, V>;
  }>();

  expect(Collection.Indexed).type.toBe<
    <T>(
      collection?: Iterable<T> | ArrayLike<T> | undefined
    ) => IndexedCollectionImpl<T>
  >();
});

test('namespace import', () => {
  expect.skip(Immutable.List).type.toBe<typeof Immutable.List>();

  expect.skip(Immutable.Map).type.toBe<typeof Immutable.Map>();

  expect.skip(Immutable.OrderedMap).type.toBe<typeof Immutable.OrderedMap>();

  expect.skip(Immutable.OrderedSet).type.toBe<typeof Immutable.OrderedSet>();

  expect(Immutable.Range).type.toBe<
    (start: number, end: number, step?: number | undefined) => RangeImpl
  >();

  expect
    .skip(Immutable.Repeat)
    .type.toBe<
      <T>(value: T, times?: number | undefined) => Immutable.Seq.Indexed<T>
    >();

  expect(Immutable.Seq).type.toBe<typeof Immutable.Seq>();

  expect.skip(Immutable.Set).type.toBe<typeof Immutable.Set>();

  expect.skip(Immutable.Stack).type.toBe<typeof Immutable.Stack>();

  expect(Immutable.Collection).type.toBe<typeof Immutable.Collection>();

  expect(Immutable.Collection.Set).type.toBe<
    <T>(
      collection?: Iterable<T> | ArrayLike<T> | undefined
    ) => SetCollectionImpl<T>
  >();

  expect(Immutable.Collection.Keyed).type.toBe<{
    <K, V>(
      collection?: Iterable<[K, V]> | undefined
    ): KeyedCollectionImpl<K, V>;
    <V>(obj: { [key: string]: V }): KeyedCollectionImpl<string, V>;
  }>();

  expect(Immutable.Collection.Indexed).type.toBe<
    <T>(
      collection?: Iterable<T> | ArrayLike<T> | undefined
    ) => IndexedCollectionImpl<T>
  >();
});
