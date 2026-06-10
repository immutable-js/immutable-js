// AUTO/SOURCE-PASS DUPLICATE of ../ts-tests/<same name>.
// Resolves `immutable` against the TS SOURCE (src/Immutable.js), to validate the
// types emitted by the migration. Tests are `.skip` until the underlying
// collection/method is migrated to TS; un-skip them as migration progresses.
// Some d.ts-only types (MapOf, RecordOf, DeepCopy) are omitted from imports
// until they exist in the source. See .agents/commands/migrate-to-ts.md.

import { Collection, List, Map, OrderedMap, Seq, Set } from 'immutable';
import { expect, test } from 'tstyche';

// Type-level coverage for shared Collection methods (defined on the
// Collection.ts classes), exercised through the concrete public types.

test.skip('subset methods keep the collection type (indexed / keyed / set / seq)', () => {
  expect(List<number>().skipWhile((x) => x < 3)).type.toBe<List<number>>();
  expect(List<number>().skipUntil((x) => x < 3)).type.toBe<List<number>>();
  expect(List<number>().takeWhile((x) => x < 3)).type.toBe<List<number>>();
  expect(List<number>().takeUntil((x) => x < 3)).type.toBe<List<number>>();
  expect(List<number>().skip(2)).type.toBe<List<number>>();
  expect(List<number>().skipLast(2)).type.toBe<List<number>>();
  expect(List<number>().take(2)).type.toBe<List<number>>();
  expect(List<number>().takeLast(2)).type.toBe<List<number>>();
  expect(List<number>().butLast()).type.toBe<List<number>>();
  expect(List<number>().rest()).type.toBe<List<number>>();
  expect(List<number>().reverse()).type.toBe<List<number>>();
  expect(List<number>().sort()).type.toBe<List<number>>();
  expect(List<number>().sortBy((x) => -x)).type.toBe<List<number>>();
  expect(List<number>().filterNot((x) => x > 1)).type.toBe<List<number>>();

  expect(Map<string, number>().skipWhile((v) => v > 1)).type.toBe<
    Map<string, number>
  >();
  expect(Map<string, number>().filterNot((v) => v > 1)).type.toBe<
    Map<string, number>
  >();
  // Sorting an unordered Map yields its ordered equivalent.
  expect(Map<string, number>().sortBy((v) => v)).type.toBe<
    Map<string, number> & OrderedMap<string, number>
  >();

  expect(Set<number>().filterNot((v) => v > 1)).type.toBe<Set<number>>();

  expect(Seq.Indexed<number>().skipWhile((x) => x < 1)).type.toBe<
    Seq.Indexed<number>
  >();
  expect(Seq.Keyed<string, number>().filterNot((v) => v > 1)).type.toBe<
    Seq.Keyed<string, number>
  >();
});

test.skip('filter narrows with a type guard, across collection types', () => {
  expect(
    List<number | string>().filter((x): x is number => typeof x === 'number')
  ).type.toBe<List<number>>();
  expect(
    Map<string, number | string>().filter(
      (v): v is number => typeof v === 'number'
    )
  ).type.toBe<Map<string, number>>();
  expect(
    Set<number | string>().filter((v): v is number => typeof v === 'number')
  ).type.toBe<Set<number>>();

  // Without a guard, filter returns the same type.
  expect(List<number>().filter((x) => x > 1)).type.toBe<List<number>>();
});

test.skip('partition splits and narrows', () => {
  expect(List<number>().partition((x) => x > 1)).type.toBe<
    [List<number>, List<number>]
  >();
  expect(
    List<number | string>().partition((x): x is string => typeof x === 'string')
  ).type.toBe<[List<number | string>, List<string>]>();
});

test.skip('flatMap returns the mapped collection type (indexed and keyed)', () => {
  expect(List([1, 2]).flatMap((x) => [x, x * 10])).type.toBe<List<number>>();
  expect(
    Map<string, number>().flatMap((v, k): Array<[string, number]> => [[k, v]])
  ).type.toBe<Map<string, number>>();
});

test.skip('flatten returns a collection', () => {
  expect(List([1, 2]).flatten()).type.toBe<Collection<unknown, unknown>>();
  expect(List([1, 2]).flatten(1)).type.toBe<Collection<unknown, unknown>>();
  expect(List([1, 2]).flatten(true)).type.toBe<Collection<unknown, unknown>>();
});

test.skip('reducing-to-a-single-value methods', () => {
  expect(List<number>().max()).type.toBe<number | undefined>();
  expect(List<number>().min((a, b) => a - b)).type.toBe<number | undefined>();
  expect(List<number>().maxBy((x) => x)).type.toBe<number | undefined>();
  expect(
    List<number>().minBy(
      (x) => x,
      (a, b) => a - b
    )
  ).type.toBe<number | undefined>();
});

test.skip('find / last family', () => {
  expect(List<number>().findLast((x) => x > 1)).type.toBe<number | undefined>();
  expect(List<number>().findLastEntry((x) => x > 1)).type.toBe<
    [number, number] | undefined
  >();
  expect(Map<string, number>().findLastKey((v) => v > 1)).type.toBe<
    string | undefined
  >();
  expect(OrderedMap<string, number>().lastKeyOf(1)).type.toBe<
    string | undefined
  >();
});

test.skip('indexed search returns number indices', () => {
  expect(List<number>().findLastIndex((x) => x > 1)).type.toBe<number>();
  expect(List<number>().lastIndexOf(1)).type.toBe<number>();
});

test.skip('indexed combination keeps the indexed type', () => {
  expect(List<number>().interpose(0)).type.toBe<List<number>>();
  expect(List<number>().interleave(List<number>())).type.toBe<List<number>>();
  expect(Seq.Indexed<number>().interpose(0)).type.toBe<Seq.Indexed<number>>();
});

test.skip('zip family produces tuples and respects arity', () => {
  expect(List<number>().zip(List<string>())).type.toBe<
    List<[number, string]>
  >();
  expect(List<number>().zip(List<string>(), List<boolean>())).type.toBe<
    List<[number, string, boolean]>
  >();
  expect(List<number>().zipAll(List<string>())).type.toBe<
    List<[number, string]>
  >();
  expect(List<number>().zipWith((a, b) => a + b, List<number>())).type.toBe<
    List<number>
  >();
  expect(
    List<number>().zipWith(
      (a, b: string, c: boolean) => `${a}${b}${c}`,
      List<string>(),
      List<boolean>()
    )
  ).type.toBe<List<string>>();
});

test.skip('flip swaps key and value types', () => {
  expect(Map<string, number>().flip()).type.toBe<Map<number, string>>();
  expect(Seq.Keyed<string, number>().flip()).type.toBe<
    Seq.Keyed<number, string>
  >();
});

test.skip('indexed-only methods are not available on keyed collections', () => {
  expect(Map<string, number>().findLastIndex((v) => v > 1)).type.toRaiseError();
  expect(Map<string, number>().lastIndexOf(1)).type.toRaiseError();
  expect(Map<string, number>().zip(List<number>())).type.toRaiseError();
  expect(Map<string, number>().interpose(0)).type.toRaiseError();
});

test.skip('flip is keyed-only', () => {
  expect(List<number>().flip()).type.toRaiseError();
});
