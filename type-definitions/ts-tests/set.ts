import { expect, pick, test } from 'tstyche';
import { Set, Map, Collection } from 'immutable';

test('#constructor', () => {
  expect(Set()).type.toBe<Set<unknown>>();

  expect(Set<number>()).type.toBe<Set<number>>();

  expect(Set([1, 'a'])).type.toBe<Set<number | string>>();

  expect<Set<number>>().type.not.toBeAssignableWith(Set([1, 'a']));
});

test('#size', () => {
  expect(pick(Set(), 'size')).type.toBe<{ readonly size: number }>();
});

test('.of', () => {
  expect(Set.of(1, 2, 3)).type.toBe<Set<number>>();

  expect(Set.of<number>('a', 1)).type.toRaiseError();

  expect(Set.of<number | string>('a', 1)).type.toBe<Set<string | number>>();
});

test('.fromKeys', () => {
  expect(Set.fromKeys(Map<number, string>())).type.toBe<Set<number>>();

  expect(Set.fromKeys<number>(Map<number, string>())).type.toBe<Set<number>>();

  expect(Set.fromKeys({ a: 1 })).type.toBe<Set<string>>();

  expect(Set.fromKeys<number>(Map<string, string>())).type.toRaiseError();

  expect(
    Set.fromKeys<number | string>(Map<number | string, string>())
  ).type.toBe<Set<string | number>>();
});

test('#get', () => {
  expect(Set<number>().get(4)).type.toBe<number | undefined>();

  expect(Set<number>().get(4, 'a')).type.toBe<number | 'a'>();

  expect(Set<number>().get<number>(4, 'a')).type.toRaiseError();
});

test('#delete', () => {
  expect(Set<number>().delete(0)).type.toBe<Set<number>>();

  expect(Set<number>().delete('a')).type.toRaiseError();
});

test('#remove', () => {
  expect(Set<number>().remove(0)).type.toBe<Set<number>>();

  expect(Set<number>().remove('a')).type.toRaiseError();
});

test('#clear', () => {
  expect(Set<number>().clear()).type.toBe<Set<number>>();

  expect(Set().clear(10)).type.toRaiseError();
});

test('#map', () => {
  expect(
    Set<number>().map((value: number, key: number, iter: Set<number>) => 1)
  ).type.toBe<Set<number>>();

  expect(
    Set<number>().map((value: number, key: number, iter: Set<number>) => 'a')
  ).type.toBe<Set<string>>();

  expect(
    Set<number>().map<number>(
      (value: number, key: number, iter: Set<number>) => 1
    )
  ).type.toBe<Set<number>>();

  expect(
    Set<number>().map<string>(
      (value: number, key: number, iter: Set<number>) => 1
    )
  ).type.toRaiseError();

  expect(
    Set<number>().map<number>(
      (value: string, key: number, iter: Set<number>) => 1
    )
  ).type.toRaiseError();

  expect(
    Set<number>().map<number>(
      (value: number, key: string, iter: Set<number>) => 1
    )
  ).type.toRaiseError();

  expect(
    Set<number>().map<number>(
      (value: number, key: number, iter: Set<string>) => 1
    )
  ).type.toRaiseError();

  expect(
    Set<number>().map<number>(
      (value: number, key: number, iter: Set<number>) => 'a'
    )
  ).type.toRaiseError();
});

test('#flatMap', () => {
  expect(
    Set<number>().flatMap((value: number, key: number, iter: Set<number>) => [
      1,
    ])
  ).type.toBe<Set<number>>();

  expect(
    Set<number>().flatMap((value: number, key: number, iter: Set<number>) => [
      'a',
    ])
  ).type.toBe<Set<string>>();

  expect(
    Set<number>().flatMap<number>(
      (value: number, key: number, iter: Set<number>) => [1]
    )
  ).type.toBe<Set<number>>();

  expect(
    Set<number>().flatMap<string>(
      (value: number, key: number, iter: Set<number>) => [1]
    )
  ).type.toRaiseError();

  expect(
    Set<number>().flatMap<number>(
      (value: string, key: number, iter: Set<number>) => [1]
    )
  ).type.toRaiseError();

  expect(
    Set<number>().flatMap<number>(
      (value: number, key: string, iter: Set<number>) => [1]
    )
  ).type.toRaiseError();

  expect(
    Set<number>().flatMap<number>(
      (value: number, key: number, iter: Set<string>) => [1]
    )
  ).type.toRaiseError();

  expect(
    Set<number>().flatMap<number>(
      (value: number, key: number, iter: Set<number>) => ['a']
    )
  ).type.toRaiseError();
});

test('#union', () => {
  expect(Set<number>().union(Set<number>())).type.toBe<Set<number>>();

  expect(Set<number>().union(Set<string>())).type.toBe<Set<string | number>>();

  expect(Set<number | string>().union(Set<string>())).type.toBe<
    Set<string | number>
  >();

  expect(Set<number | string>().union(Set<number>())).type.toBe<
    Set<string | number>
  >();
});

test('#merge', () => {
  expect(Set<number>().merge(Set<number>())).type.toBe<Set<number>>();

  expect(Set<number>().merge(Set<string>())).type.toBe<Set<string | number>>();

  expect(Set<number | string>().merge(Set<string>())).type.toBe<
    Set<string | number>
  >();

  expect(Set<number | string>().merge(Set<number>())).type.toBe<
    Set<string | number>
  >();
});

test('#intersect', () => {
  expect(Set<number>().intersect(Set<number>())).type.toBe<Set<number>>();

  expect(Set<number>().intersect(Set<string>())).type.toRaiseError();

  expect(Set<number | string>().intersect(Set<string>())).type.toBe<
    Set<string | number>
  >();

  expect(Set<number | string>().intersect(Set<number>())).type.toBe<
    Set<string | number>
  >();
});

test('#subtract', () => {
  expect(Set<number>().subtract(Set<number>())).type.toBe<Set<number>>();

  expect(Set<number>().subtract(Set<string>())).type.toRaiseError();

  expect(Set<number | string>().subtract(Set<string>())).type.toBe<
    Set<string | number>
  >();

  expect(Set<number | string>().subtract(Set<number>())).type.toBe<
    Set<string | number>
  >();
});

test('#flatten', () => {
  expect(Set<number>().flatten()).type.toBe<Collection<unknown, unknown>>();

  expect(Set<number>().flatten(10)).type.toBe<Collection<unknown, unknown>>();

  expect(Set<number>().flatten(false)).type.toBe<
    Collection<unknown, unknown>
  >();

  expect(Set<number>().flatten('a')).type.toRaiseError();
});

test('#withMutations', () => {
  expect(Set<number>().withMutations(mutable => mutable)).type.toBe<
    Set<number>
  >();

  expect(
    Set<number>().withMutations((mutable: Set<string>) => mutable)
  ).type.toRaiseError();
});

test('#asMutable', () => {
  expect(Set<number>().asMutable()).type.toBe<Set<number>>();
});

test('#asImmutable', () => {
  expect(Set<number>().asImmutable()).type.toBe<Set<number>>();
});

test('#toJS', () => {
  expect(Set<Set<number>>().toJS()).type.toBe<number[][]>();
});

test('#toJSON', () => {
  expect(Set<Set<number>>().toJSON()).type.toBe<Set<number>[]>();
});
