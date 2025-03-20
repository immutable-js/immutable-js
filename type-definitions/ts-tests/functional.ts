import { expect, test } from 'tstyche';
import {
  get,
  getIn,
  has,
  hasIn,
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

test('getIn', () => {
  expect(getIn('a', ['length' as const])).type.toBe<never>();

  expect(getIn([1, 2, 3], [0])).type.toBe<number>();

  // first parameter type is Array<number> so we can not detect that the number will be invalid
  expect(getIn([1, 2, 3], [99])).type.toBe<number>();

  // We do not handle List in getIn TS type yet (hard to convert to a tuple)
  expect(getIn([1, 2, 3], List([0]))).type.toBe<unknown>();

  expect(getIn([1, 2, 3], [0], 'a' as const)).type.toBe<number>();

  expect(getIn(List([1, 2, 3]), [0])).type.toBe<number>();

  // first parameter type is Array<number> so we can not detect that the number will be invalid
  expect(getIn(List([1, 2, 3]), [99])).type.toBe<number>();

  expect(getIn(List([1, 2, 3]), ['a' as const])).type.toBe<never>();

  expect(
    getIn(List([1, 2, 3]), ['a' as const], 'missing')
  ).type.toBe<'missing'>();

  expect(getIn({ x: 10, y: 20 }, ['x' as const])).type.toBe<number>();

  expect(
    getIn({ x: 10, y: 20 }, ['z' as const], 'missing')
  ).type.toBe<'missing'>();

  expect(getIn({ x: { y: 20 } }, ['x' as const])).type.toBe<{ y: number }>();

  expect(getIn({ x: { y: 20 } }, ['z' as const])).type.toBe<never>();

  expect(
    getIn({ x: { y: 20 } }, ['x' as const, 'y' as const])
  ).type.toBe<number>();

  expect(
    getIn({ x: Map({ y: 20 }) }, ['x' as const, 'y' as const])
  ).type.toBe<number>();

  expect(
    getIn(Map({ x: Map({ y: 20 }) }), ['x' as const, 'y' as const])
  ).type.toBe<number>();

  const o = Map({ x: List([Map({ y: 20 })]) });

  expect(getIn(o, ['x' as const, 'y' as const])).type.toBe<never>();

  expect(getIn(o, ['x' as const])).type.toBe<List<MapOf<{ y: number }>>>();

  expect(getIn(o, ['x' as const, 0])).type.toBe<MapOf<{ y: number }>>();

  expect(getIn(o, ['x' as const, 0, 'y' as const])).type.toBe<number>();
});

test('has', () => {
  expect(has([1, 2, 3], 0)).type.toBeBoolean();

  expect(has({ x: 10, y: 20 }, 'x')).type.toBeBoolean();
});

test('hasIn', () => {
  expect(hasIn('a', ['length' as const])).type.toBe<never>();

  expect(hasIn(123, [])).type.toBe<never>();

  expect(hasIn(true, [])).type.toBe<never>();

  expect(hasIn([1, 2, 3], [0])).type.toBe<boolean>();

  // first parameter type is Array<number> so we can not detect that the number will be invalid
  expect(hasIn([1, 2, 3], [99])).type.toBe<boolean>();

  // We do not handle List in hasIn TS type yet (hard to convert to a tuple)
  expect(hasIn([1, 2, 3], List([0]))).type.toBe<boolean>();

  expect(hasIn(List([1, 2, 3]), [0])).type.toBe<boolean>();

  // first parameter type is Array<number> so we can not detect that the number will be invalid
  expect(hasIn(List([1, 2, 3]), [99])).type.toBe<boolean>();

  expect(hasIn(List([1, 2, 3]), ['a' as const])).type.toBe<boolean>();

  expect(hasIn({ x: 10, y: 20 }, ['x' as const])).type.toBe<boolean>();

  expect(hasIn({ x: { y: 20 } }, ['z' as const])).type.toBe<boolean>();

  expect(
    hasIn({ x: { y: 20 } }, ['x' as const, 'y' as const])
  ).type.toBe<boolean>();

  expect(
    hasIn({ x: Map({ y: 20 }) }, ['x' as const, 'y' as const])
  ).type.toBe<boolean>();

  expect(
    hasIn(Map({ x: Map({ y: 20 }) }), ['x' as const, 'y' as const])
  ).type.toBe<boolean>();

  const o = Map({ x: List([Map({ y: 20 })]) });

  expect(hasIn(o, ['x' as const, 'y' as const])).type.toBe<boolean>();

  expect(hasIn(o, ['x' as const, 0, 'y' as const])).type.toBe<boolean>();
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
