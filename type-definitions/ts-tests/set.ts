import { expect, test } from 'tstyche';
import { Set, Map, Collection } from 'immutable';

test('#constructor', () => {
  expect(Set()).type.toEqual<Set<unknown>>();

  expect(Set<number>()).type.toEqual<Set<number>>();

  expect(Set([1, 'a'])).type.toEqual<Set<number | string>>();
});

test('#size', () => {
  expect(Set().size).type.toBeNumber();

  expect(Set()).type.toMatch<{ readonly size: number }>();
});

test('.of', () => {
  expect(Set.of(1, 2, 3)).type.toEqual<Set<number>>();

  expect(Set.of<number>('a', 1)).type.toRaiseError();

  expect(Set.of<number | string>('a', 1)).type.toEqual<Set<string | number>>();
});

test('.fromKeys', () => {
  expect(Set.fromKeys(Map<number, string>())).type.toEqual<Set<number>>();

  expect(Set.fromKeys<number>(Map<number, string>())).type.toEqual<
    Set<number>
  >();

  expect(Set.fromKeys({ a: 1 })).type.toEqual<Set<string>>();

  expect(Set.fromKeys<number>(Map<string, string>())).type.toRaiseError();

  expect(
    Set.fromKeys<number | string>(Map<number | string, string>())
  ).type.toEqual<Set<string | number>>();
});

test('#get', () => {
  expect(Set<number>().get(4)).type.toEqual<number | undefined>();

  expect(Set<number>().get(4, 'a')).type.toEqual<number | 'a'>();

  expect(Set<number>().get<number>(4, 'a')).type.toRaiseError();
});

test('#delete', () => {
  expect(Set<number>().delete(0)).type.toEqual<Set<number>>();

  expect(Set<number>().delete('a')).type.toRaiseError();
});

test('#remove', () => {
  expect(Set<number>().remove(0)).type.toEqual<Set<number>>();

  expect(Set<number>().remove('a')).type.toRaiseError();
});

test('#clear', () => {
  expect(Set<number>().clear()).type.toEqual<Set<number>>();

  expect(Set().clear(10)).type.toRaiseError();
});

test('#map', () => {
  expect(
    Set<number>().map((value: number, key: number, iter: Set<number>) => 1)
  ).type.toEqual<Set<number>>();

  expect(
    Set<number>().map((value: number, key: number, iter: Set<number>) => 'a')
  ).type.toEqual<Set<string>>();

  expect(
    Set<number>().map<number>(
      (value: number, key: number, iter: Set<number>) => 1
    )
  ).type.toEqual<Set<number>>();

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
  ).type.toEqual<Set<number>>();

  expect(
    Set<number>().flatMap((value: number, key: number, iter: Set<number>) => [
      'a',
    ])
  ).type.toEqual<Set<string>>();

  expect(
    Set<number>().flatMap<number>(
      (value: number, key: number, iter: Set<number>) => [1]
    )
  ).type.toEqual<Set<number>>();

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
  expect(Set<number>().union(Set<number>())).type.toEqual<Set<number>>();

  expect(Set<number>().union(Set<string>())).type.toEqual<
    Set<string | number>
  >();

  expect(Set<number | string>().union(Set<string>())).type.toEqual<
    Set<string | number>
  >();

  expect(Set<number | string>().union(Set<number>())).type.toEqual<
    Set<string | number>
  >();
});

test('#merge', () => {
  expect(Set<number>().merge(Set<number>())).type.toEqual<Set<number>>();

  expect(Set<number>().merge(Set<string>())).type.toEqual<
    Set<string | number>
  >();

  expect(Set<number | string>().merge(Set<string>())).type.toEqual<
    Set<string | number>
  >();

  expect(Set<number | string>().merge(Set<number>())).type.toEqual<
    Set<string | number>
  >();
});

test('#intersect', () => {
  expect(Set<number>().intersect(Set<number>())).type.toEqual<Set<number>>();

  expect(Set<number>().intersect(Set<string>())).type.toRaiseError();

  expect(Set<number | string>().intersect(Set<string>())).type.toEqual<
    Set<string | number>
  >();

  expect(Set<number | string>().intersect(Set<number>())).type.toEqual<
    Set<string | number>
  >();
});

test('#subtract', () => {
  expect(Set<number>().subtract(Set<number>())).type.toEqual<Set<number>>();

  expect(Set<number>().subtract(Set<string>())).type.toRaiseError();

  expect(Set<number | string>().subtract(Set<string>())).type.toEqual<
    Set<string | number>
  >();

  expect(Set<number | string>().subtract(Set<number>())).type.toEqual<
    Set<string | number>
  >();
});

test('#flatten', () => {
  expect(Set<number>().flatten()).type.toEqual<Collection<unknown, unknown>>();

  expect(Set<number>().flatten(10)).type.toEqual<
    Collection<unknown, unknown>
  >();

  expect(Set<number>().flatten(false)).type.toEqual<
    Collection<unknown, unknown>
  >();

  expect(Set<number>().flatten('a')).type.toRaiseError();
});

test('#withMutations', () => {
  expect(Set<number>().withMutations(mutable => mutable)).type.toEqual<
    Set<number>
  >();

  expect(
    Set<number>().withMutations((mutable: Set<string>) => mutable)
  ).type.toRaiseError();
});

test('#asMutable', () => {
  expect(Set<number>().asMutable()).type.toEqual<Set<number>>();
});

test('#asImmutable', () => {
  expect(Set<number>().asImmutable()).type.toEqual<Set<number>>();
});

test('#toJS', () => {
  expect(Set<Set<number>>().toJS()).type.toEqual<number[][]>();
});

test('#toJSON', () => {
  expect(Set<Set<number>>().toJSON()).type.toEqual<Set<number>[]>();
});
