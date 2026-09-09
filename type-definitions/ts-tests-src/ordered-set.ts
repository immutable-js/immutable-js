// AUTO/SOURCE-PASS DUPLICATE of ../ts-tests/<same name>.
// Resolves `immutable` against the TS SOURCE (src/Immutable.js), to validate the
// types emitted by the migration. Tests are `.skip` until the underlying
// collection/method is migrated to TS; un-skip them as migration progresses.
// Some d.ts-only types (MapOf, RecordOf, DeepCopy) are omitted from imports
// until they exist in the source. See .agents/commands/migrate-to-ts.md.

import { Collection, Map, OrderedSet } from 'immutable';
import { expect, pick, test } from 'tstyche';

test.skip('#constructor', () => {
  expect(OrderedSet()).type.toBe<OrderedSet<unknown>>();

  expect(OrderedSet<number>()).type.toBe<OrderedSet<number>>();

  expect(OrderedSet([1, 'a'])).type.toBe<OrderedSet<number | string>>();

  expect(OrderedSet([1, 'a'])).type.not.toBeAssignableTo(OrderedSet<number>());
});

test.skip('#size', () => {
  expect(pick(OrderedSet(), 'size')).type.toBe<{ readonly size: number }>();
});

test.skip('.of', () => {
  expect(OrderedSet.of(1, 2, 3)).type.toBe<OrderedSet<number>>();

  expect(OrderedSet.of<number>('a', 1)).type.toRaiseError();

  expect(OrderedSet.of<number | string>('a', 1)).type.toBe<
    OrderedSet<string | number>
  >();
});

test.skip('.fromKeys', () => {
  expect(OrderedSet.fromKeys(Map<number, string>())).type.toBe<
    OrderedSet<number>
  >();

  expect(OrderedSet.fromKeys<number>(Map<number, string>())).type.toBe<
    OrderedSet<number>
  >();

  expect(OrderedSet.fromKeys({ a: 1 })).type.toBe<OrderedSet<string>>();

  expect(
    OrderedSet.fromKeys<number>(Map<string, string>())
  ).type.toRaiseError();

  expect(
    OrderedSet.fromKeys<number | string>(Map<number | string, string>())
  ).type.toBe<OrderedSet<string | number>>();
});

test.skip('#get', () => {
  expect(OrderedSet<number>().get(4)).type.toBe<number | undefined>();

  expect(OrderedSet<number>().get(4, 'a')).type.toBe<number | 'a'>();

  expect(OrderedSet<number>().get<number>(4, 'a')).type.toRaiseError();
});

test.skip('#delete', () => {
  expect(OrderedSet<number>().delete(0)).type.toBe<OrderedSet<number>>();

  expect(OrderedSet<number>().delete('a')).type.toRaiseError();
});

test.skip('#remove', () => {
  expect(OrderedSet<number>().remove(0)).type.toBe<OrderedSet<number>>();

  expect(OrderedSet<number>().remove('a')).type.toRaiseError();
});

test.skip('#clear', () => {
  expect(OrderedSet<number>().clear()).type.toBe<OrderedSet<number>>();

  expect(OrderedSet().clear(10)).type.toRaiseError();
});

test.skip('#map', () => {
  expect(
    OrderedSet<number>().map(
      (value: number, key: number, iter: OrderedSet<number>) => 1
    )
  ).type.toBe<OrderedSet<number>>();

  expect(
    OrderedSet<number>().map(
      (value: number, key: number, iter: OrderedSet<number>) => 'a'
    )
  ).type.toBe<OrderedSet<string>>();

  expect(
    OrderedSet<number>().map<number>(
      (value: number, key: number, iter: OrderedSet<number>) => 1
    )
  ).type.toBe<OrderedSet<number>>();

  expect(
    OrderedSet<number>().map<string>(
      (value: number, key: number, iter: OrderedSet<number>) => 1
    )
  ).type.toRaiseError();

  expect(
    OrderedSet<number>().map<number>(
      (value: string, key: number, iter: OrderedSet<number>) => 1
    )
  ).type.toRaiseError();

  expect(
    OrderedSet<number>().map<number>(
      (value: number, key: string, iter: OrderedSet<number>) => 1
    )
  ).type.toRaiseError();

  expect(
    OrderedSet<number>().map<number>(
      (value: number, key: number, iter: OrderedSet<string>) => 1
    )
  ).type.toRaiseError();

  expect(
    OrderedSet<number>().map<number>(
      (value: number, key: number, iter: OrderedSet<number>) => 'a'
    )
  ).type.toRaiseError();
});

test.skip('#flatMap', () => {
  expect(
    OrderedSet<number>().flatMap(
      (value: number, key: number, iter: OrderedSet<number>) => [1]
    )
  ).type.toBe<OrderedSet<number>>();

  expect(
    OrderedSet<number>().flatMap(
      (value: number, key: number, iter: OrderedSet<number>) => ['a']
    )
  ).type.toBe<OrderedSet<string>>();

  expect(
    OrderedSet<number>().flatMap<number>(
      (value: number, key: number, iter: OrderedSet<number>) => [1]
    )
  ).type.toBe<OrderedSet<number>>();

  expect(
    OrderedSet<number>().flatMap<string>(
      (value: number, key: number, iter: OrderedSet<number>) => [1]
    )
  ).type.toRaiseError();

  expect(
    OrderedSet<number>().flatMap<number>(
      (value: string, key: number, iter: OrderedSet<number>) => [1]
    )
  ).type.toRaiseError();

  expect(
    OrderedSet<number>().flatMap<number>(
      (value: number, key: string, iter: OrderedSet<number>) => [1]
    )
  ).type.toRaiseError();

  expect(
    OrderedSet<number>().flatMap<number>(
      (value: number, key: number, iter: OrderedSet<string>) => [1]
    )
  ).type.toRaiseError();

  expect(
    OrderedSet<number>().flatMap<number>(
      (value: number, key: number, iter: OrderedSet<number>) => ['a']
    )
  ).type.toRaiseError();
});

test.skip('#union', () => {
  expect(OrderedSet<number>().union(OrderedSet<number>())).type.toBe<
    OrderedSet<number>
  >();

  expect(OrderedSet<number>().union(OrderedSet<string>())).type.toBe<
    OrderedSet<string | number>
  >();

  expect(OrderedSet<number | string>().union(OrderedSet<string>())).type.toBe<
    OrderedSet<string | number>
  >();

  expect(OrderedSet<number | string>().union(OrderedSet<number>())).type.toBe<
    OrderedSet<string | number>
  >();
});

test.skip('#merge', () => {
  expect(OrderedSet<number>().merge(OrderedSet<number>())).type.toBe<
    OrderedSet<number>
  >();

  expect(OrderedSet<number>().merge(OrderedSet<string>())).type.toBe<
    OrderedSet<string | number>
  >();

  expect(OrderedSet<number | string>().merge(OrderedSet<string>())).type.toBe<
    OrderedSet<string | number>
  >();

  expect(OrderedSet<number | string>().merge(OrderedSet<number>())).type.toBe<
    OrderedSet<string | number>
  >();
});

test.skip('#intersect', () => {
  expect(OrderedSet<number>().intersect(OrderedSet<number>())).type.toBe<
    OrderedSet<number>
  >();

  expect(
    OrderedSet<number>().intersect(OrderedSet<string>())
  ).type.toRaiseError();

  expect(
    OrderedSet<number | string>().intersect(OrderedSet<string>())
  ).type.toBe<OrderedSet<string | number>>();

  expect(
    OrderedSet<number | string>().intersect(OrderedSet<number>())
  ).type.toBe<OrderedSet<string | number>>();
});

test.skip('#subtract', () => {
  expect(OrderedSet<number>().subtract(OrderedSet<number>())).type.toBe<
    OrderedSet<number>
  >();

  expect(
    OrderedSet<number>().subtract(OrderedSet<string>())
  ).type.toRaiseError();

  expect(
    OrderedSet<number | string>().subtract(OrderedSet<string>())
  ).type.toBe<OrderedSet<string | number>>();

  expect(
    OrderedSet<number | string>().subtract(OrderedSet<number>())
  ).type.toBe<OrderedSet<string | number>>();
});

test.skip('#flatten', () => {
  expect(OrderedSet<number>().flatten()).type.toBe<
    Collection<unknown, unknown>
  >();

  expect(OrderedSet<number>().flatten(10)).type.toBe<
    Collection<unknown, unknown>
  >();

  expect(OrderedSet<number>().flatten(false)).type.toBe<
    Collection<unknown, unknown>
  >();

  expect(OrderedSet<number>().flatten('a')).type.toRaiseError();
});

test.skip('#withMutations', () => {
  expect(OrderedSet<number>().withMutations((mutable) => mutable)).type.toBe<
    OrderedSet<number>
  >();

  expect(
    OrderedSet<number>().withMutations((mutable: OrderedSet<string>) => mutable)
  ).type.toRaiseError();
});

test.skip('#asMutable', () => {
  expect(OrderedSet<number>().asMutable()).type.toBe<OrderedSet<number>>();
});

test.skip('#asImmutable', () => {
  expect(OrderedSet<number>().asImmutable()).type.toBe<OrderedSet<number>>();
});
