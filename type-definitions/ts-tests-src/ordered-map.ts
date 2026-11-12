// AUTO/SOURCE-PASS DUPLICATE of ../ts-tests/<same name>.
// Resolves `immutable` against the TS SOURCE (src/Immutable.js), to validate the
// types emitted by the migration. Tests are `.skip` until the underlying
// collection/method is migrated to TS; un-skip them as migration progresses.
// Some d.ts-only types (MapOf, RecordOf, DeepCopy) are omitted from imports
// until they exist in the source. See .agents/commands/migrate-to-ts.md.

import { List, OrderedMap } from 'immutable';
import { expect, pick, test } from 'tstyche';

test.skip('#constructor', () => {
  expect(OrderedMap()).type.toBe<OrderedMap<unknown, unknown>>();

  expect(OrderedMap<number, number>()).type.toBe<OrderedMap<number, number>>();

  expect(OrderedMap([[1, 'a']])).type.toBe<OrderedMap<number, string>>();

  expect(OrderedMap(List<[number, string]>([[1, 'a']]))).type.toBe<
    OrderedMap<number, string>
  >();

  expect(OrderedMap({ a: 1 })).type.toBe<OrderedMap<string, number>>();

  // No longer works in typescript@>=3.9
  // // $ExpectError - TypeScript does not support Lists as tuples
  // OrderedMap(List([List(['a', 'b'])]));
});

test.skip('#size', () => {
  expect(pick(OrderedMap(), 'size')).type.toBe<{ readonly size: number }>();
});

test.skip('#get', () => {
  expect(OrderedMap<number, number>().get(4)).type.toBe<number | undefined>();

  expect(OrderedMap<number, number>().get(4, 'a')).type.toBe<number | 'a'>();

  expect(OrderedMap<number, number>().get<number>(4, 'a')).type.toRaiseError();
});

test.skip('#set', () => {
  expect(OrderedMap<number, number>().set(0, 0)).type.toBe<
    OrderedMap<number, number>
  >();

  expect(OrderedMap<number, number>().set(1, 'a')).type.toRaiseError();

  expect(OrderedMap<number, number>().set('a', 1)).type.toRaiseError();

  expect(OrderedMap<number, number | string>().set(0, 1)).type.toBe<
    OrderedMap<number, string | number>
  >();

  expect(OrderedMap<number, number | string>().set(0, 'a')).type.toBe<
    OrderedMap<number, string | number>
  >();
});

test.skip('#setIn', () => {
  expect(OrderedMap<number, number>().setIn([], 0)).type.toBe<
    OrderedMap<number, number>
  >();
});

test.skip('#delete', () => {
  expect(OrderedMap<number, number>().delete(0)).type.toBe<
    OrderedMap<number, number>
  >();

  expect(OrderedMap<number, number>().delete('a')).type.toRaiseError();
});

test.skip('#deleteAll', () => {
  expect(OrderedMap<number, number>().deleteAll([0])).type.toBe<
    OrderedMap<number, number>
  >();

  expect(OrderedMap<number, number>().deleteAll([0, 'a'])).type.toRaiseError();
});

test.skip('#deleteIn', () => {
  expect(OrderedMap<number, number>().deleteIn([])).type.toBe<
    OrderedMap<number, number>
  >();
});

test.skip('#remove', () => {
  expect(OrderedMap<number, number>().remove(0)).type.toBe<
    OrderedMap<number, number>
  >();

  expect(OrderedMap<number, number>().remove('a')).type.toRaiseError();
});

test.skip('#removeAll', () => {
  expect(OrderedMap<number, number>().removeAll([0])).type.toBe<
    OrderedMap<number, number>
  >();

  expect(OrderedMap<number, number>().removeAll([0, 'a'])).type.toRaiseError();
});

test.skip('#removeIn', () => {
  expect(OrderedMap<number, number>().removeIn([])).type.toBe<
    OrderedMap<number, number>
  >();
});

test.skip('#clear', () => {
  expect(OrderedMap<number, number>().clear()).type.toBe<
    OrderedMap<number, number>
  >();

  expect(OrderedMap().clear(10)).type.toRaiseError();
});

test.skip('#update', () => {
  expect(OrderedMap().update((v) => 1)).type.toBe<number>();

  expect(
    OrderedMap<number, number>().update(
      (v: OrderedMap<string> | undefined) => v
    )
  ).type.toRaiseError();

  expect(
    OrderedMap<number, number>().update(0, (v: number | undefined) => 0)
  ).type.toBe<OrderedMap<number, number>>();

  expect(
    OrderedMap<number, number>().update(0, (v: number | undefined) => v + 'a')
  ).type.toRaiseError();

  expect(
    OrderedMap<number, number>().update(1, 10, (v: number | undefined) => 0)
  ).type.toBe<OrderedMap<number, number>>();

  expect(
    OrderedMap<number, number>().update(1, 'a', (v: number | undefined) => 0)
  ).type.toRaiseError();

  expect(
    OrderedMap<number, number>().update(
      1,
      10,
      (v: number | undefined) => v + 'a'
    )
  ).type.toRaiseError();
});

test.skip('#updateIn', () => {
  expect(OrderedMap<number, number>().updateIn([], (v) => v)).type.toBe<
    OrderedMap<number, number>
  >();

  expect(OrderedMap<number, number>().updateIn([], 10)).type.toRaiseError();
});

test.skip('#map', () => {
  expect(
    OrderedMap<number, number>().map(
      (value: number, key: number, iter: OrderedMap<number, number>) => 1
    )
  ).type.toBe<OrderedMap<number, number>>();

  expect(
    OrderedMap<number, number>().map(
      (value: number, key: number, iter: OrderedMap<number, number>) => 'a'
    )
  ).type.toBe<OrderedMap<number, string>>();

  expect(
    OrderedMap<number, number>().map<number>(
      (value: number, key: number, iter: OrderedMap<number, number>) => 1
    )
  ).type.toBe<OrderedMap<number, number>>();

  expect(
    OrderedMap<number, number>().map<string>(
      (value: number, key: number, iter: OrderedMap<number, number>) => 1
    )
  ).type.toRaiseError();

  expect(
    OrderedMap<number, number>().map<number>(
      (value: string, key: number, iter: OrderedMap<number, number>) => 1
    )
  ).type.toRaiseError();

  expect(
    OrderedMap<number, number>().map<number>(
      (value: number, key: string, iter: OrderedMap<number, number>) => 1
    )
  ).type.toRaiseError();

  expect(
    OrderedMap<number, number>().map<number>(
      (value: number, key: number, iter: OrderedMap<number, string>) => 1
    )
  ).type.toRaiseError();

  expect(
    OrderedMap<number, number>().map<number>(
      (value: number, key: number, iter: OrderedMap<number, number>) => 'a'
    )
  ).type.toRaiseError();
});

test.skip('#mapKeys', () => {
  expect(
    OrderedMap<number, number>().mapKeys(
      (value: number, key: number, iter: OrderedMap<number, number>) => 1
    )
  ).type.toBe<OrderedMap<number, number>>();

  expect(
    OrderedMap<number, number>().mapKeys(
      (value: number, key: number, iter: OrderedMap<number, number>) => 'a'
    )
  ).type.toBe<OrderedMap<string, number>>();

  expect(
    OrderedMap<number, number>().mapKeys<number>(
      (value: number, key: number, iter: OrderedMap<number, number>) => 1
    )
  ).type.toBe<OrderedMap<number, number>>();

  expect(
    OrderedMap<number, number>().mapKeys<string>(
      (value: number, key: number, iter: OrderedMap<number, number>) => 1
    )
  ).type.toRaiseError();

  expect(
    OrderedMap<number, number>().mapKeys<number>(
      (value: string, key: number, iter: OrderedMap<number, number>) => 1
    )
  ).type.toRaiseError();

  expect(
    OrderedMap<number, number>().mapKeys<number>(
      (value: number, key: string, iter: OrderedMap<number, number>) => 1
    )
  ).type.toRaiseError();

  expect(
    OrderedMap<number, number>().mapKeys<number>(
      (value: number, key: number, iter: OrderedMap<number, string>) => 1
    )
  ).type.toRaiseError();

  expect(
    OrderedMap<number, number>().mapKeys<number>(
      (value: number, key: number, iter: OrderedMap<number, number>) => 'a'
    )
  ).type.toRaiseError();
});

test.skip('#flatMap', () => {
  expect(
    OrderedMap<number, number>().flatMap(
      (value: number, key: number, iter: OrderedMap<number, number>) => [[0, 1]]
    )
  ).type.toBe<OrderedMap<number, number>>();

  expect(
    OrderedMap<number, number>().flatMap(
      (value: number, key: number, iter: OrderedMap<number, number>) => [
        ['a', 'b'],
      ]
    )
  ).type.toBe<OrderedMap<string, string>>();

  expect(
    OrderedMap<number, number>().flatMap<number, number>(
      (value: number, key: number, iter: OrderedMap<number, number>) => [[0, 1]]
    )
  ).type.toBe<OrderedMap<number, number>>();

  expect(
    OrderedMap<number, number>().flatMap<number, string>(
      (value: number, key: number, iter: OrderedMap<number, number>) => [[0, 1]]
    )
  ).type.toRaiseError();

  expect(
    OrderedMap<number, number>().flatMap<number, number>(
      (value: string, key: number, iter: OrderedMap<number, number>) => [[0, 1]]
    )
  ).type.toRaiseError();

  expect(
    OrderedMap<number, number>().flatMap<number, number>(
      (value: number, key: string, iter: OrderedMap<number, number>) => [[0, 1]]
    )
  ).type.toRaiseError();

  expect(
    OrderedMap<number, number>().flatMap<number, number>(
      (value: number, key: number, iter: OrderedMap<number, string>) => [[0, 1]]
    )
  ).type.toRaiseError();

  expect(
    OrderedMap<number, number>().flatMap<number, number>(
      (value: number, key: number, iter: OrderedMap<number, number>) => [
        [0, 'a'],
      ]
    )
  ).type.toRaiseError();
});

test.skip('#merge', () => {
  expect(OrderedMap<string, number>().merge({ a: 1 })).type.toBe<
    OrderedMap<string, number>
  >();

  expect(OrderedMap<string, number>().merge({ a: { b: 1 } })).type.toBe<
    OrderedMap<string, number | { b: number }>
  >();

  expect(
    OrderedMap<number, number>().merge(OrderedMap<number, number>())
  ).type.toBe<OrderedMap<number, number>>();

  expect(
    OrderedMap<number, number>().merge(OrderedMap<number, string>())
  ).type.toBe<OrderedMap<number, string | number>>();

  expect(
    OrderedMap<number, number | string>().merge(OrderedMap<number, string>())
  ).type.toBe<OrderedMap<number, string | number>>();

  expect(
    OrderedMap<number, number | string>().merge(OrderedMap<number, number>())
  ).type.toBe<OrderedMap<number, string | number>>();
});

test.skip('#mergeIn', () => {
  expect(OrderedMap<number, number>().mergeIn([], [])).type.toBe<
    OrderedMap<number, number>
  >();
});

test.skip('#mergeWith', () => {
  expect(
    OrderedMap<number, number>().mergeWith(
      (prev: number, next: number, key: number) => 1,
      OrderedMap<number, number>()
    )
  ).type.toBe<OrderedMap<number, number>>();

  expect(
    OrderedMap<number, number>().mergeWith(
      (prev: string, next: number, key: number) => 1,
      OrderedMap<number, number>()
    )
  ).type.toRaiseError();

  expect(
    OrderedMap<number, number>().mergeWith(
      (prev: number, next: string, key: number) => 1,
      OrderedMap<number, number>()
    )
  ).type.toRaiseError();

  expect(
    OrderedMap<number, number>().mergeWith(
      (prev: number, next: number, key: string) => 1,
      OrderedMap<number, number>()
    )
  ).type.toRaiseError();

  expect(
    OrderedMap<number, number>().mergeWith(
      (prev: number, next: number, key: number) => 'a',
      OrderedMap<number, number>()
    )
  ).type.toBe<OrderedMap<number, string | number>>();

  expect(
    OrderedMap<number, number>().mergeWith(
      (prev: number, next: number, key: number) => 1,
      OrderedMap<number, string>()
    )
  ).type.toRaiseError();

  expect(
    OrderedMap<string, number>().mergeWith(
      (prev: number, next: number, key: string) => 1,
      { a: 1 }
    )
  ).type.toBe<OrderedMap<string, number>>();

  expect(
    OrderedMap<string, number>().mergeWith(
      (prev: number, next: number, key: string) => 1,
      { a: 'a' }
    )
  ).type.toRaiseError();

  expect(
    OrderedMap<number, number | string>().mergeWith(
      (prev: number | string, next: number | string, key: number) => 1,
      OrderedMap<number, string>()
    )
  ).type.toBe<OrderedMap<number, string | number>>();
});

test.skip('#mergeDeep', () => {
  expect(OrderedMap<string, number>().mergeDeep({ a: 1 })).type.toBe<
    OrderedMap<string, number>
  >();

  expect(OrderedMap<string, number>().mergeDeep({ a: { b: 1 } })).type.toBe<
    OrderedMap<string, number | { b: number }>
  >();

  expect(
    OrderedMap<number, number>().mergeDeep(OrderedMap<number, number>())
  ).type.toBe<OrderedMap<number, number>>();

  expect(
    OrderedMap<number, number>().mergeDeep(OrderedMap<number, string>())
  ).type.toBe<OrderedMap<number, string | number>>();

  expect(
    OrderedMap<number, number | string>().mergeDeep(
      OrderedMap<number, string>()
    )
  ).type.toBe<OrderedMap<number, string | number>>();

  expect(
    OrderedMap<number, number | string>().mergeDeep(
      OrderedMap<number, number>()
    )
  ).type.toBe<OrderedMap<number, string | number>>();
});

test.skip('#mergeDeepIn', () => {
  expect(OrderedMap<number, number>().mergeDeepIn([], [])).type.toBe<
    OrderedMap<number, number>
  >();
});

test.skip('#mergeDeepWith', () => {
  expect(
    OrderedMap<number, number>().mergeDeepWith(
      (prev: unknown, next: unknown, key: unknown) => 1,
      OrderedMap<number, number>()
    )
  ).type.toBe<OrderedMap<number, number>>();

  expect(
    OrderedMap<number, number>().mergeDeepWith(
      (prev: unknown, next: unknown, key: unknown) => 1,
      OrderedMap<number, string>()
    )
  ).type.toRaiseError();

  expect(
    OrderedMap<string, number>().mergeDeepWith(
      (prev: unknown, next: unknown, key: unknown) => 1,
      { a: 1 }
    )
  ).type.toBe<OrderedMap<string, number>>();

  expect(
    OrderedMap<string, number>().mergeDeepWith(
      (prev: unknown, next: unknown, key: unknown) => 1,
      { a: 'a' }
    )
  ).type.toRaiseError();

  expect(
    OrderedMap<number, number | string>().mergeDeepWith(
      (prev: unknown, next: unknown, key: unknown) => 1,
      OrderedMap<number, string>()
    )
  ).type.toBe<OrderedMap<number, string | number>>();
});

test.skip('#flip', () => {
  expect(OrderedMap<number, string>().flip()).type.toBe<
    OrderedMap<string, number>
  >();
});

test.skip('#withMutations', () => {
  expect(
    OrderedMap<number, number>().withMutations((mutable) => mutable)
  ).type.toBe<OrderedMap<number, number>>();

  expect(
    OrderedMap<number, number>().withMutations(
      (mutable: OrderedMap<string>) => mutable
    )
  ).type.toRaiseError();
});

test.skip('#asMutable', () => {
  expect(OrderedMap<number, number>().asMutable()).type.toBe<
    OrderedMap<number, number>
  >();
});

test.skip('#asImmutable', () => {
  expect(OrderedMap<number, number>().asImmutable()).type.toBe<
    OrderedMap<number, number>
  >();
});
