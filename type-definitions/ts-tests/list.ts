import { expect, pick, test } from 'tstyche';
import {
  List,
  get,
  set,
  remove,
  update,
  setIn,
  removeIn,
  updateIn,
  merge,
} from 'immutable';

test('#constructor', () => {
  expect(List()).type.toBe<List<unknown>>();

  expect<List<number>>().type.toBeAssignableWith(List<number>());

  expect<List<number | string>>().type.toBeAssignableWith(List([1, 'a']));
  expect<List<number>>().type.not.toBeAssignableWith(List([1, 'a']));
});

test('#size', () => {
  expect(pick(List(), 'size')).type.toBe<{ readonly size: number }>();
});

test('#setSize', () => {
  expect(List<number>().setSize(10)).type.toBe<List<number>>();

  expect(List<number>().setSize('foo')).type.toRaiseError();
});

test('.of', () => {
  expect(List.of(1, 2, 3)).type.toBe<List<number>>();

  expect(List.of<number>('a', 1)).type.toRaiseError();

  expect(List.of<number | string>('a', 1)).type.toBe<List<string | number>>();
});

test('#get', () => {
  expect(List<number>().get(4)).type.toBe<number | undefined>();

  expect(List<number>().get(4, 'a')).type.toBe<number | 'a'>();

  expect(List<number>().get<number>(4, 'a')).type.toRaiseError();

  expect(get(List<number>(), 4)).type.toBe<number | undefined>();

  expect(get(List<number>(), 4, 'a')).type.toBe<number | 'a'>();
});

test('#set', () => {
  expect(List<number>().set(0, 0)).type.toBe<List<number>>();

  expect(List<number>().set(1, 'a')).type.toRaiseError();

  expect(List<number>().set('a', 1)).type.toRaiseError();

  expect(List<number | string>().set(0, 1)).type.toBe<List<string | number>>();

  expect(List<number | string>().set(0, 'a')).type.toBe<
    List<string | number>
  >();

  expect(set(List<number>(), 0, 0)).type.toBe<List<number>>();
});

test('#first', () => {
  const a = List<number>().first();
  //    ^?
  expect(List<number>().first()).type.toBe<number | undefined>();
  expect(List<number>().first('first')).type.toBe<number | 'first'>();
});

test('#last', () => {
  expect(List<number>().last()).type.toBe<number | undefined>();
  expect(List<number>().last('last')).type.toBe<number | 'last'>();
});

test('#set', () => {
  expect(set(List<number>(), 1, 'a')).type.toRaiseError();

  expect(set(List<number>(), 'a', 1)).type.toRaiseError();
});

test('#setIn', () => {
  expect(List<number>().setIn([], 0)).type.toBe<List<number>>();

  expect(setIn(List<number>(), [], 0)).type.toBe<List<number>>();
});

test('#insert', () => {
  expect(List<number>().insert(0, 0)).type.toBe<List<number>>();

  expect(List<number>().insert(1, 'a')).type.toRaiseError();

  expect(List<number>().insert('a', 1)).type.toRaiseError();

  expect(List<number | string>().insert(0, 1)).type.toBe<
    List<string | number>
  >();

  expect(List<number | string>().insert(0, 'a')).type.toBe<
    List<string | number>
  >();
});

test('#push', () => {
  expect(List<number>().push(0, 0)).type.toBe<List<number>>();

  expect(List<number>().push(1, 'a')).type.toRaiseError();

  expect(List<number>().push('a', 1)).type.toRaiseError();

  expect(List<number | string>().push(0, 1)).type.toBe<List<string | number>>();

  expect(List<number | string>().push(0, 'a')).type.toBe<
    List<string | number>
  >();
});

test('#unshift', () => {
  expect(List<number>().unshift(0, 0)).type.toBe<List<number>>();

  expect(List<number>().unshift(1, 'a')).type.toRaiseError();

  expect(List<number>().unshift('a', 1)).type.toRaiseError();

  expect(List<number | string>().unshift(0, 1)).type.toBe<
    List<string | number>
  >();

  expect(List<number | string>().unshift(0, 'a')).type.toBe<
    List<string | number>
  >();
});

test('#delete', () => {
  expect(List<number>().delete(0)).type.toBe<List<number>>();

  expect(List().delete('a')).type.toRaiseError();
});

test('#deleteIn', () => {
  expect(List<number>().deleteIn([])).type.toBe<List<number>>();
});

test('#remove', () => {
  expect(List<number>().remove(0)).type.toBe<List<number>>();

  expect(List().remove('a')).type.toRaiseError();

  expect(remove(List<number>(), 0)).type.toBe<List<number>>();
});

test('#removeIn', () => {
  expect(List<number>().removeIn([])).type.toBe<List<number>>();

  expect(removeIn(List<number>(), [])).type.toBe<List<number>>();
});

test('#clear', () => {
  expect(List<number>().clear()).type.toBe<List<number>>();

  expect(List().clear(10)).type.toRaiseError();
});

test('#pop', () => {
  expect(List<number>().pop()).type.toBe<List<number>>();

  expect(List().pop(10)).type.toRaiseError();
});

test('#shift', () => {
  expect(List<number>().shift()).type.toBe<List<number>>();

  expect(List().shift(10)).type.toRaiseError();
});

test('#update', () => {
  expect(List().update(v => 1)).type.toBeNumber();

  expect(
    List<number>().update((v: List<string> | undefined) => v)
  ).type.toRaiseError();

  expect(List<number>().update(0, (v: number | undefined) => 0)).type.toBe<
    List<number>
  >();

  expect(
    List<number>().update(0, (v: number | undefined) => v + 'a')
  ).type.toRaiseError();

  expect(List<number>().update(1, 10, (v: number | undefined) => 0)).type.toBe<
    List<number>
  >();

  expect(
    List<number>().update(1, 'a', (v: number | undefined) => 0)
  ).type.toRaiseError();

  expect(
    List<number>().update(1, 10, (v: number | undefined) => v + 'a')
  ).type.toRaiseError();

  expect(List<string>().update(1, v => v?.toUpperCase())).type.toBe<
    List<string>
  >();

  expect(update(List<number>(), 0, (v: number | undefined) => 0)).type.toBe<
    List<number>
  >();

  expect(
    update(List<number>(), 1, 10, (v: number) => v + 'a')
  ).type.toRaiseError();
});

test('#updateIn', () => {
  expect(List<number>().updateIn([], v => v)).type.toBe<List<number>>();

  expect(List<number>().updateIn([], 10)).type.toRaiseError();

  expect(updateIn(List<number>(), [], v => v)).type.toBe<List<number>>();
});

test('#map', () => {
  expect(
    List<number>().map((value: number, key: number, iter: List<number>) => 1)
  ).type.toBe<List<number>>();

  expect(
    List<number>().map((value: number, key: number, iter: List<number>) => 'a')
  ).type.toBe<List<string>>();

  expect(
    List<number>().map<number>(
      (value: number, key: number, iter: List<number>) => 1
    )
  ).type.toBe<List<number>>();

  expect(
    List<number>().map<string>(
      (value: number, key: number, iter: List<number>) => 1
    )
  ).type.toRaiseError();

  expect(
    List<number>().map<number>(
      (value: string, key: number, iter: List<number>) => 1
    )
  ).type.toRaiseError();

  expect(
    List<number>().map<number>(
      (value: number, key: string, iter: List<number>) => 1
    )
  ).type.toRaiseError();

  expect(
    List<number>().map<number>(
      (value: number, key: number, iter: List<string>) => 1
    )
  ).type.toRaiseError();

  expect(
    List<number>().map<number>(
      (value: number, key: number, iter: List<number>) => 'a'
    )
  ).type.toRaiseError();
});

test('#flatMap', () => {
  expect(
    List<number>().flatMap((value: number, key: number, iter: List<number>) => [
      1,
    ])
  ).type.toBe<List<number>>();

  expect(
    List<number>().flatMap((value: number, key: number, iter: List<number>) => [
      'a',
    ])
  ).type.toBe<List<string>>();

  expect(List<List<string>>().flatMap(list => list)).type.toBe<List<string>>();

  expect(
    List<number>().flatMap<number>(
      (value: number, key: number, iter: List<number>) => [1]
    )
  ).type.toBe<List<number>>();

  expect(
    List<number>().flatMap<string>(
      (value: number, key: number, iter: List<number>) => [1]
    )
  ).type.toRaiseError();

  expect(
    List<number>().flatMap<number>(
      (value: string, key: number, iter: List<number>) => [1]
    )
  ).type.toRaiseError();

  expect(
    List<number>().flatMap<number>(
      (value: number, key: string, iter: List<number>) => [1]
    )
  ).type.toRaiseError();

  expect(
    List<number>().flatMap<number>(
      (value: number, key: number, iter: List<string>) => [1]
    )
  ).type.toRaiseError();

  expect(
    List<number>().flatMap<number>(
      (value: number, key: number, iter: List<number>) => ['a']
    )
  ).type.toRaiseError();
});

test('#merge', () => {
  expect(List<number>().merge(List<number>())).type.toBe<List<number>>();

  expect(List<number>().merge(List<string>())).type.toBe<
    List<string | number>
  >();

  expect(List<number | string>().merge(List<string>())).type.toBe<
    List<string | number>
  >();

  expect(List<number | string>().merge(List<number>())).type.toBe<
    List<string | number>
  >();

  expect(merge(List<number>(), List<number>())).type.toBe<List<number>>();
});

test('#mergeIn', () => {
  expect(List<number>().mergeIn([], [])).type.toBe<List<number>>();
});

test('#mergeDeepIn', () => {
  expect(List<number>().mergeDeepIn([], [])).type.toBe<List<number>>();
});

test('#flatten', () => {
  expect(List<number>().flatten()).type.toBe<
    Immutable.Collection<unknown, unknown>
  >();

  expect(List<number>().flatten(10)).type.toBe<
    Immutable.Collection<unknown, unknown>
  >();

  expect(List<number>().flatten(false)).type.toBe<
    Immutable.Collection<unknown, unknown>
  >();

  expect(List<number>().flatten('a')).type.toRaiseError();
});

test('#withMutations', () => {
  expect(List<number>().withMutations(mutable => mutable)).type.toBe<
    List<number>
  >();

  expect(
    List<number>().withMutations((mutable: List<string>) => mutable)
  ).type.toRaiseError();
});

test('#asMutable', () => {
  expect(List<number>().asMutable()).type.toBe<List<number>>();
});

test('#asImmutable', () => {
  expect(List<number>().asImmutable()).type.toBe<List<number>>();
});

test('#toJS', () => {
  expect(List<List<number>>().toJS()).type.toBe<number[][]>();
});

test('#toJSON', () => {
  expect(List<List<number>>().toJSON()).type.toBe<List<number>[]>();
});

test('for of loops', () => {
  const list = List([1, 2, 3, 4]);

  for (const val of list) {
    expect(val).type.toBeNumber();
  }
});
