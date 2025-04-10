import { expect, test } from 'tstyche';
import { fromJS, Collection, List, Map, MapOf } from 'immutable';

test('fromJS', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect(fromJS({}, (a: any, b: any) => b)).type.toBe<
    Collection<unknown, unknown>
  >();

  expect(fromJS('abc')).type.toBe<string>();

  expect(fromJS([0, 1, 2])).type.toBe<List<number>>();

  expect(fromJS(List([0, 1, 2]))).type.toBe<List<number>>();

  expect(fromJS({ a: 0, b: 1, c: 2 })).type.toBe<
    Map<'b' | 'a' | 'c', number>
  >();

  expect(fromJS(Map({ a: 0, b: 1, c: 2 }))).type.toBe<
    MapOf<{ a: number; b: number; c: number }>
  >();

  expect(fromJS([{ a: 0 }])).type.toBe<List<Map<'a', number>>>();

  expect(fromJS({ a: [0] })).type.toBe<Map<'a', List<number>>>();

  expect(fromJS([[[0]]])).type.toBe<List<List<List<number>>>>();

  expect(fromJS({ a: { b: { c: 0 } } })).type.toBe<
    Map<'a', Map<'b', Map<'c', number>>>
  >();
});

test('fromJS in an array of function', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const create = [(data: any) => data, fromJS][1];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect(create({ a: 'A' })).type.toBe<any>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createConst = ([(data: any) => data, fromJS] as const)[1];

  expect(createConst({ a: 'A' })).type.toBe<Map<'a', string>>();
});
