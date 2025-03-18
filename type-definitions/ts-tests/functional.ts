import { expect, test } from 'tstyche';
import {
  get,
  getIn,
  has,
  set,
  remove,
  update,
  Map,
  List,
  MapOf,
} from 'immutable';

test('get', () => {
  expect(get([1, 2, 3], 0)).type.toBe<number | undefined>();

  expect(get([1, 2, 3], 0, 'a')).type.toBe<number | 'a'>();

  expect(get({ x: 10, y: 20 }, 'x')).type.toBe<number | undefined>();

  expect(get({ x: 10, y: 20 }, 'z', 'missing')).type.toBe<number | 'missing'>();
});

test.only('getIn', () => {
  expect(getIn('a', ['length'])).type.toBe<never>();

  expect(getIn([1, 2, 3], [0])).type.toBe<number>();

  expect(getIn([1, 2, 3], [0], 'a')).type.toBe<number>();

  expect(getIn(List([1, 2, 3]), [0])).type.toBe<number>();

  expect(getIn(List([1, 2, 3]), ['a'])).type.toBe<never>();

  expect(getIn(List([1, 2, 3]), ['a'], 'missing')).type.toBe<'missing'>();

  expect(getIn({ x: 10, y: 20 }, ['x'])).type.toBe<number>();

  expect(getIn({ x: 10, y: 20 }, ['z'], 'missing')).type.toBe<'missing'>();

  expect(getIn({ x: { y: 20 } }, ['x'])).type.toBe<{ y: number }>();

  expect(getIn({ x: { y: 20 } }, ['z'])).type.toBe<never>();

  expect(getIn({ x: { y: 20 } }, ['x', 'y'])).type.toBe<number>();

  expect(getIn({ x: Map({ y: 20 }) }, ['x', 'y'])).type.toBe<number>();

  expect(getIn(Map({ x: Map({ y: 20 }) }), ['x', 'y'])).type.toBe<number>();

  const o = Map({ x: List([Map({ y: 20 })]) });

  expect(getIn(o, ['x', 'y'])).type.toBe<never>();

  expect(getIn(o, ['x'])).type.toBe<List<MapOf<{ y: number }>>>();

  expect(getIn(o, ['x', 0])).type.toBe<MapOf<{ y: number }>>();

  expect(getIn(o, ['x', 0, 'y'])).type.toBe<number>();
});

test('has', () => {
  expect(has([1, 2, 3], 0)).type.toBeBoolean();

  expect(has({ x: 10, y: 20 }, 'x')).type.toBeBoolean();
});

test('set', () => {
  expect(set([1, 2, 3], 0, 10)).type.toBe<number[]>();

  expect(set([1, 2, 3], 0, 'a')).type.toRaiseError();

  expect(set([1, 2, 3], 'a', 0)).type.toRaiseError();

  expect(set({ x: 10, y: 20 }, 'x', 100)).type.toBe<{
    x: number;
    y: number;
  }>();

  expect(set({ x: 10, y: 20 }, 'x', 'a')).type.toRaiseError();
});

test('remove', () => {
  expect(remove([1, 2, 3], 0)).type.toBe<number[]>();

  expect(remove({ x: 10, y: 20 }, 'x')).type.toBe<{
    x: number;
    y: number;
  }>();
});

test('update', () => {
  expect(update([1, 2, 3], 0, (v: number) => v + 1)).type.toBe<number[]>();

  expect(update([1, 2, 3], 0, 1)).type.toRaiseError();

  expect(update([1, 2, 3], 0, (v: string) => v + 'a')).type.toRaiseError();

  expect(update([1, 2, 3], 'a', (v: number) => v + 1)).type.toRaiseError();

  expect(update({ x: 10, y: 20 }, 'x', (v: number) => v + 1)).type.toBe<{
    x: number;
    y: number;
  }>();

  expect(
    update({ x: 10, y: 20 }, 'x', (v: string) => v + 'a')
  ).type.toRaiseError();
});
