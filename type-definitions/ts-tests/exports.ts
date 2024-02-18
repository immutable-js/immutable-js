// Some tests look like they are repeated in order to avoid false positives.

import { expectType } from 'tsd';
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

expectType<typeof List>(List);
expectType<typeof Map>(Map);
expectType<typeof OrderedMap>(OrderedMap);
expectType<typeof OrderedSet>(OrderedSet);
// TODO: Turn on once https://github.com/Microsoft/dtslint/issues/19 is resolved.
expectType<
  (start: number, end: number, step?: number | undefined) => Seq.Indexed<number>
>(Range);
expectType<<T>(value: T, times?: number | undefined) => Seq.Indexed<T>>(Repeat);
expectType<typeof Seq>(Seq);
expectType<typeof Set>(Set);
expectType<typeof Stack>(Stack);
expectType<typeof Collection>(Collection);
expectType<
  <T>(collection?: Iterable<T> | ArrayLike<T> | undefined) => Collection.Set<T>
>(Collection.Set);
expectType<{
  <K, V>(collection?: Iterable<[K, V]> | undefined): Collection.Keyed<K, V>;
  <V>(obj: { [key: string]: V }): Collection.Keyed<string, V>;
}>(Collection.Keyed);
expectType<
  <T>(
    collection?: Iterable<T> | ArrayLike<T> | undefined
  ) => Collection.Indexed<T>
>(Collection.Indexed);

expectType<typeof List>(Immutable.List);
expectType<typeof Map>(Immutable.Map);
expectType<typeof OrderedMap>(Immutable.OrderedMap);
expectType<typeof OrderedSet>(Immutable.OrderedSet);
// TODO: Turn on once https://github.com/Microsoft/dtslint/issues/19 is resolved.
expectType<
  (start: number, end: number, step?: number | undefined) => Seq.Indexed<number>
>(Immutable.Range);
expectType<<T>(value: T, times?: number | undefined) => Seq.Indexed<T>>(
  Immutable.Repeat
);
expectType<typeof Seq>(Immutable.Seq);
expectType<typeof Set>(Immutable.Set);
expectType<typeof Stack>(Immutable.Stack);
expectType<typeof Collection>(Immutable.Collection);
expectType<
  <T>(
    collection?: Iterable<T> | ArrayLike<T> | undefined
  ) => Immutable.Collection.Set<T>
>(Immutable.Collection.Set);
expectType<{
  <K, V>(collection?: Iterable<[K, V]> | undefined): Immutable.Collection.Keyed<K, V>;
  <V>(obj: { [key: string]: V }): Immutable.Collection.Keyed<string, V>;
}>(Immutable.Collection.Keyed);
expectType<
  <T>(
    collection?: Iterable<T> | ArrayLike<T> | undefined
  ) => Immutable.Collection.Indexed<T>
>(Immutable.Collection.Indexed);
