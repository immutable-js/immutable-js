import {
  List,
  Map,
  MapOf,
  OrderedMap,
  Record,
  Stack,
  get,
  getIn,
  has,
  hasIn,
  remove,
  set,
  update,
} from 'immutable';
import { expect, test } from 'tstyche';

test('get', () => {
  expect(get([1, 2, 3], 0)).type.toBe<number | undefined>();

  expect(get([1, 2, 3], 0, 'a')).type.toBe<number | 'a'>();

  expect(get({ x: 10, y: 20 }, 'x')).type.toBe<number | undefined>();

  expect(get({ x: 10, y: 20 }, 'z', 'missing')).type.toBe<number | 'missing'>();
});

test('getIn', () => {
  // nothing can be read below a primitive
  expect(getIn('a', ['length'])).type.toRaiseError('no key can be read from');

  expect(getIn([1, 2, 3], [0])).type.toBe<number>();

  // first parameter type is Array<number> so we can not detect that the number will be invalid
  expect(getIn([1, 2, 3], [99])).type.toBe<number>();

  // We do not handle List in getIn TS type yet (hard to convert to a tuple)
  expect(getIn([1, 2, 3], List([0]))).type.toBe<unknown>();

  expect(getIn([1, 2, 3], [0], 'a')).type.toBe<number>();

  // like with `get`, the index of a List may be missing
  expect(getIn(List([1, 2, 3]), [0])).type.toBe<number | undefined>();

  expect(getIn(List([1, 2, 3]), [0], 'nsv')).type.toBe<number | 'nsv'>();

  // first parameter type is Array<number> so we can not detect that the number will be invalid
  expect(getIn(List([1, 2, 3]), [99])).type.toBe<number | undefined>();

  // an invalid path is a type error
  expect(getIn(List([1, 2, 3]), ['a'])).type.toRaiseError('expected one of');

  // unless a `notSetValue` is given: it is then the result
  expect(getIn(List([1, 2, 3]), ['a'], 'missing')).type.toBe<'missing'>();

  expect(getIn({ x: 10, y: 20 }, ['x'])).type.toBe<number>();

  expect(getIn({ x: 10, y: 20 }, ['z'], 'missing')).type.toBe<'missing'>();

  expect(getIn({ x: { y: 20 } }, ['x'])).type.toBe<{ y: number }>();

  expect(getIn({ x: { y: 20 } }, ['z'])).type.toRaiseError('expected one of');

  expect(getIn({ x: { y: 20 } }, ['x', 'y'])).type.toBe<number>();

  expect(getIn({ x: Map({ y: 20 }) }, ['x', 'y'])).type.toBe<number>();

  expect(getIn(Map({ x: Map({ y: 20 }) }), ['x', 'y'])).type.toBe<number>();

  const o = Map({ x: List([Map({ y: 20 })]) });

  expect(getIn(o, ['x', 'y'])).type.toRaiseError();

  expect(getIn(o, ['x'])).type.toBe<List<MapOf<{ y: number }>>>();

  expect(getIn(o, ['x', 0])).type.toBe<MapOf<{ y: number }> | undefined>();

  expect(getIn(o, ['x', 0, 'y'])).type.toBe<number | undefined>();

  // an empty path gives the value itself back
  expect(getIn({ x: 10, y: 20 }, [])).type.toBe<{ x: number; y: number }>();

  // a path only known at runtime
  const path: Array<string> = ['x'];

  expect(getIn({ x: 10, y: 20 }, path)).type.toBe<unknown>();

  const readonlyPath: ReadonlyArray<string> = ['x'];

  expect(getIn({ x: 10, y: 20 }, readonlyPath)).type.toBe<unknown>();

  // a path given `as const`
  const constPath = ['x', 'y'] as const;

  expect(getIn({ x: { y: 20 } }, constPath)).type.toBe<number>();

  // a path forwarded by a generic function
  function forward<C, P extends ReadonlyArray<PropertyKey>>(
    object: C,
    keyPath: P
  ) {
    return getIn(object, keyPath);
  }

  expect(forward({ x: 10 }, ['x'])).type.toBe<unknown>();

  // an iterable which is neither an array nor an ordered collection is a type error
  const iterablePath: Iterable<string> = ['x'];

  expect(getIn({ x: 10, y: 20 }, iterablePath)).type.toRaiseError();

  // an array-like path
  expect(getIn({ x: 10, y: 20 }, { length: 1, 0: 'x' })).type.toBe<unknown>();

  expect(
    getIn({ x: 10, y: 20 }, { length: 1, 0: 'x' }, 'nsv')
  ).type.toBe<unknown>();

  // a key that may be `null` is a type error: the caller has to narrow it
  const maybeKey = 'y' as string | null;

  expect(getIn({ x: { y: 20 } }, ['x', maybeKey])).type.toRaiseError();

  // a value on the way may be missing
  expect(getIn({ x: { y: 20 } as { y: number } | null }, ['x', 'y'])).type.toBe<
    number | undefined
  >();

  // nothing is known below an `unknown` value
  expect(getIn({ x: {} as unknown }, ['x', 'y'])).type.toBe<unknown>();

  // collections with unknown keys
  expect(getIn(Map({ x: Map<string, number>() }), ['x', 'y'])).type.toBe<
    number | undefined
  >();

  expect(getIn({ x: OrderedMap<string, number>() }, ['x', 'y'])).type.toBe<
    number | undefined
  >();

  expect(
    getIn({ x: OrderedMap<string, number>() }, ['x', 'y'], null)
  ).type.toBe<number | null>();

  // a union of objects on the way: only some of them have the key
  const union = { x: { y: 1 } as { y: number } | { z: string } };

  expect(getIn(union, ['x', 'y'])).type.toBe<number | undefined>();

  expect(getIn(union, ['x', 'y'], 'nsv')).type.toBe<number | 'nsv'>();

  // a generic collection or key: the path can not be checked
  function genericCollection<T extends { x: { y: number } }>(collection: T) {
    return getIn(collection, ['x', 'y']);
  }

  expect(genericCollection({ x: { y: 1 } })).type.toBe<number>();

  function nestedGenericCollection<T extends { x: { y: number } }>(nested: T) {
    return getIn({ nested }, ['nested', 'x', 'y']);
  }

  expect(nestedGenericCollection({ x: { y: 1 } })).type.toBe<number>();

  function genericKey<T extends object>(collection: T, key: keyof T) {
    return getIn(collection, [key]);
  }

  expect(genericKey({ x: 1 }, 'x')).type.toBe<number>();

  expect(getIn({ x: Stack([1]) }, ['x', 0])).type.toBe<number | undefined>();

  // Record
  const Point = Record({ x: 0, y: 0 });

  expect(getIn(Point(), ['x'])).type.toBe<number>();

  expect(getIn({ p: Point() }, ['p', 'x'])).type.toBe<number>();

  expect(getIn({ p: Point() }, ['p', 'get'])).type.toRaiseError();

  // with a `notSetValue`, it replaces the `undefined` of a missing value on the way
  expect(
    getIn({ x: { y: 20 } as { y: number } | null }, ['x', 'y'], 'nsv')
  ).type.toBe<number | 'nsv'>();
});

test('has', () => {
  expect(has([1, 2, 3], 0)).type.toBe<boolean>();

  expect(has({ x: 10, y: 20 }, 'x')).type.toBe<boolean>();
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
