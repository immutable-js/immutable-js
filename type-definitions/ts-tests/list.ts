import { expect, test } from 'tstyche';
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
  expect(List()).type.toEqual<List<unknown>>();

  expect<List<number>>().type.toBeAssignable(List<number>());

  expect<List<number | string>>().type.toBeAssignable(List([1, 'a']));
  expect<List<number>>().type.not.toBeAssignable(List([1, 'a']));
});

test('#size', () => {
  expect(List().size).type.toBeNumber();

  expect(List()).type.toMatch<{ readonly size: number }>();
});

test('#setSize', () => {
  expect(List<number>().setSize(10)).type.toEqual<List<number>>();

  expect(List<number>().setSize('foo')).type.toRaiseError();
});

test('.of', () => {
  expect(List.of(1, 2, 3)).type.toEqual<List<number>>();

  expect(List.of<number>('a', 1)).type.toRaiseError();

  expect(List.of<number | string>('a', 1)).type.toEqual<
    List<string | number>
  >();
});

test('#get', () => {
  expect(List<number>().get(4)).type.toEqual<number | undefined>();

  expect(List<number>().get(4, 'a')).type.toEqual<number | 'a'>();

  expect(List<number>().get<number>(4, 'a')).type.toRaiseError();

  expect(get(List<number>(), 4)).type.toEqual<number | undefined>();

  expect(get(List<number>(), 4, 'a')).type.toEqual<number | 'a'>();
});

test('#set', () => {
  expect(List<number>().set(0, 0)).type.toEqual<List<number>>();

  expect(List<number>().set(1, 'a')).type.toRaiseError();

  expect(List<number>().set('a', 1)).type.toRaiseError();

  expect(List<number | string>().set(0, 1)).type.toEqual<
    List<string | number>
  >();

  expect(List<number | string>().set(0, 'a')).type.toEqual<
    List<string | number>
  >();

  expect(set(List<number>(), 0, 0)).type.toEqual<List<number>>();

  expect(set(List<number>(), 1, 'a')).type.toRaiseError();

  expect(set(List<number>(), 'a', 1)).type.toRaiseError();
});

test('#setIn', () => {
  expect(List<number>().setIn([], 0)).type.toEqual<List<number>>();

  expect(setIn(List<number>(), [], 0)).type.toEqual<List<number>>();
});

test('#insert', () => {
  expect(List<number>().insert(0, 0)).type.toEqual<List<number>>();

  expect(List<number>().insert(1, 'a')).type.toRaiseError();

  expect(List<number>().insert('a', 1)).type.toRaiseError();

  expect(List<number | string>().insert(0, 1)).type.toEqual<
    List<string | number>
  >();

  expect(List<number | string>().insert(0, 'a')).type.toEqual<
    List<string | number>
  >();
});

test('#push', () => {
  expect(List<number>().push(0, 0)).type.toEqual<List<number>>();

  expect(List<number>().push(1, 'a')).type.toRaiseError();

  expect(List<number>().push('a', 1)).type.toRaiseError();

  expect(List<number | string>().push(0, 1)).type.toEqual<
    List<string | number>
  >();

  expect(List<number | string>().push(0, 'a')).type.toEqual<
    List<string | number>
  >();
});

test('#unshift', () => {
  expect(List<number>().unshift(0, 0)).type.toEqual<List<number>>();

  expect(List<number>().unshift(1, 'a')).type.toRaiseError();

  expect(List<number>().unshift('a', 1)).type.toRaiseError();

  expect(List<number | string>().unshift(0, 1)).type.toEqual<
    List<string | number>
  >();

  expect(List<number | string>().unshift(0, 'a')).type.toEqual<
    List<string | number>
  >();
});

test('#delete', () => {
  expect(List<number>().delete(0)).type.toEqual<List<number>>();

  expect(List().delete('a')).type.toRaiseError();
});

test('#deleteIn', () => {
  expect(List<number>().deleteIn([])).type.toEqual<List<number>>();
});

test('#remove', () => {
  expect(List<number>().remove(0)).type.toEqual<List<number>>();

  expect(List().remove('a')).type.toRaiseError();

  expect(remove(List<number>(), 0)).type.toEqual<List<number>>();
});

test('#removeIn', () => {
  expect(List<number>().removeIn([])).type.toEqual<List<number>>();

  expect(removeIn(List<number>(), [])).type.toEqual<List<number>>();
});

test('#clear', () => {
  expect(List<number>().clear()).type.toEqual<List<number>>();

  expect(List().clear(10)).type.toRaiseError();
});

test('#pop', () => {
  expect(List<number>().pop()).type.toEqual<List<number>>();

  expect(List().pop(10)).type.toRaiseError();
});

test('#shift', () => {
  expect(List<number>().shift()).type.toEqual<List<number>>();

  expect(List().shift(10)).type.toRaiseError();
});

test('#update', () => {
  expect(List().update(v => 1)).type.toBeNumber();

  expect(
    List<number>().update((v: List<string> | undefined) => v)
  ).type.toRaiseError();

  expect(List<number>().update(0, (v: number | undefined) => 0)).type.toEqual<
    List<number>
  >();

  expect(
    List<number>().update(0, (v: number | undefined) => v + 'a')
  ).type.toRaiseError();

  expect(
    List<number>().update(1, 10, (v: number | undefined) => 0)
  ).type.toEqual<List<number>>();

  expect(
    List<number>().update(1, 'a', (v: number | undefined) => 0)
  ).type.toRaiseError();

  expect(
    List<number>().update(1, 10, (v: number | undefined) => v + 'a')
  ).type.toRaiseError();

  expect(List<string>().update(1, v => v?.toUpperCase())).type.toEqual<
    List<string>
  >();

  expect(update(List<number>(), 0, (v: number | undefined) => 0)).type.toEqual<
    List<number>
  >();

  expect(
    update(List<number>(), 1, 10, (v: number) => v + 'a')
  ).type.toRaiseError();
});

test('#updateIn', () => {
  expect(List<number>().updateIn([], v => v)).type.toEqual<List<number>>();

  expect(List<number>().updateIn([], 10)).type.toRaiseError();

  expect(updateIn(List<number>(), [], v => v)).type.toEqual<List<number>>();
});

test('#map', () => {
  expect(
    List<number>().map((value: number, key: number, iter: List<number>) => 1)
  ).type.toEqual<List<number>>();

  expect(
    List<number>().map((value: number, key: number, iter: List<number>) => 'a')
  ).type.toEqual<List<string>>();

  expect(
    List<number>().map<number>(
      (value: number, key: number, iter: List<number>) => 1
    )
  ).type.toEqual<List<number>>();

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
  ).type.toEqual<List<number>>();

  expect(
    List<number>().flatMap((value: number, key: number, iter: List<number>) => [
      'a',
    ])
  ).type.toEqual<List<string>>();

  expect(List<List<string>>().flatMap(list => list)).type.toEqual<
    List<string>
  >();

  expect(
    List<number>().flatMap<number>(
      (value: number, key: number, iter: List<number>) => [1]
    )
  ).type.toEqual<List<number>>();

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
  expect(List<number>().merge(List<number>())).type.toEqual<List<number>>();

  expect(List<number>().merge(List<string>())).type.toEqual<
    List<string | number>
  >();

  expect(List<number | string>().merge(List<string>())).type.toEqual<
    List<string | number>
  >();

  expect(List<number | string>().merge(List<number>())).type.toEqual<
    List<string | number>
  >();

  expect(merge(List<number>(), List<number>())).type.toEqual<List<number>>();
});

test('#mergeIn', () => {
  expect(List<number>().mergeIn([], [])).type.toEqual<List<number>>();
});

test('#mergeDeepIn', () => {
  expect(List<number>().mergeDeepIn([], [])).type.toEqual<List<number>>();
});

test('#flatten', () => {
  expect(List<number>().flatten()).type.toEqual<
    Immutable.Collection<unknown, unknown>
  >();

  expect(List<number>().flatten(10)).type.toEqual<
    Immutable.Collection<unknown, unknown>
  >();

  expect(List<number>().flatten(false)).type.toEqual<
    Immutable.Collection<unknown, unknown>
  >();

  expect(List<number>().flatten('a')).type.toRaiseError();
});

test('#withMutations', () => {
  expect(List<number>().withMutations(mutable => mutable)).type.toEqual<
    List<number>
  >();

  expect(
    List<number>().withMutations((mutable: List<string>) => mutable)
  ).type.toRaiseError();
});

test('#asMutable', () => {
  expect(List<number>().asMutable()).type.toEqual<List<number>>();
});

test('#asImmutable', () => {
  expect(List<number>().asImmutable()).type.toEqual<List<number>>();
});

test('#toJS', () => {
  expect(List<List<number>>().toJSON()).type.toEqual<List<number>[]>();
});

test('#toJSON', () => {
  expect(List<List<number>>().toJSON()).type.toEqual<List<number>[]>();
});

test('for of loops', () => {
  const list = List([1, 2, 3, 4]);

  for (const val of list) {
    expect(val).type.toBeNumber();
  }
});
