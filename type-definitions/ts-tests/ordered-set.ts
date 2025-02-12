import { expect, pick, test } from 'tstyche';
import { Collection, OrderedSet, Map } from 'immutable';

test('#constructor', () => {
  expect(OrderedSet()).type.toBe<OrderedSet<unknown>>();

  expect(OrderedSet<number>()).type.toBe<OrderedSet<number>>();

  expect(OrderedSet([1, 'a'])).type.toBe<OrderedSet<number | string>>();

  expect(OrderedSet([1, 'a'])).type.not.toBeAssignableTo(OrderedSet<number>());
});

test('#size', () => {
  expect(pick(OrderedSet(), 'size')).type.toBe<{ readonly size: number }>();
});

test('.of', () => {
  expect(OrderedSet.of(1, 2, 3)).type.toBe<OrderedSet<number>>();

  expect(OrderedSet.of<number>('a', 1)).type.toRaiseError();

  expect(OrderedSet.of<number | string>('a', 1)).type.toBe<
    OrderedSet<string | number>
  >();
});

test('.fromKeys', () => {
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

test('#get', () => {
  expect(OrderedSet<number>().get(4)).type.toBe<number | undefined>();

  expect(OrderedSet<number>().get(4, 'a')).type.toBe<number | 'a'>();

  expect(OrderedSet<number>().get<number>(4, 'a')).type.toRaiseError();
});

test('#delete', () => {
  expect(OrderedSet<number>().delete(0)).type.toBe<OrderedSet<number>>();

  expect(OrderedSet<number>().delete('a')).type.toRaiseError();
});

test('#remove', () => {
  expect(OrderedSet<number>().remove(0)).type.toBe<OrderedSet<number>>();

  expect(OrderedSet<number>().remove('a')).type.toRaiseError();
});

test('#clear', () => {
  expect(OrderedSet<number>().clear()).type.toBe<OrderedSet<number>>();

  expect(OrderedSet().clear(10)).type.toRaiseError();
});

test('#map', () => {
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

test('#flatMap', () => {
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

test('#union', () => {
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

test('#merge', () => {
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

test('#intersect', () => {
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

test('#subtract', () => {
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

test('#flatten', () => {
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

test('#withMutations', () => {
  expect(OrderedSet<number>().withMutations((mutable) => mutable)).type.toBe<
    OrderedSet<number>
  >();

  expect(
    OrderedSet<number>().withMutations((mutable: OrderedSet<string>) => mutable)
  ).type.toRaiseError();
});

test('#asMutable', () => {
  expect(OrderedSet<number>().asMutable()).type.toBe<OrderedSet<number>>();
});

test('#asImmutable', () => {
  expect(OrderedSet<number>().asImmutable()).type.toBe<OrderedSet<number>>();
});
