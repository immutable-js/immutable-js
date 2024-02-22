import { expect, test } from 'tstyche';
import { fromJS, Collection, List, Map, MapOf } from 'immutable';

test('fromJs', () => {
  expect(fromJS({}, (a: any, b: any) => b)).type.toEqual<
    Collection<unknown, unknown>
  >();

  expect(fromJS('abc')).type.toBeString();

  expect(fromJS([0, 1, 2])).type.toEqual<List<number>>();

  expect(fromJS(List([0, 1, 2]))).type.toEqual<List<number>>();

  expect(fromJS({ a: 0, b: 1, c: 2 })).type.toEqual<
    Map<'b' | 'a' | 'c', number>
  >();

  expect(fromJS(Map({ a: 0, b: 1, c: 2 }))).type.toEqual<
    MapOf<{ a: number; b: number; c: number }>
  >();

  expect(fromJS([{ a: 0 }])).type.toEqual<List<Map<'a', number>>>();

  expect(fromJS({ a: [0] })).type.toEqual<Map<'a', List<number>>>();

  expect(fromJS([[[0]]])).type.toEqual<List<List<List<number>>>>();

  expect(fromJS({ a: { b: { c: 0 } } })).type.toEqual<
    Map<'a', Map<'b', Map<'c', number>>>
  >();
});

test('fromJS in an array of function', () => {
  const create = [(data: any) => data, fromJS][1];

  expect(create({ a: 'A' })).type.toBeAny();

  const createConst = ([(data: any) => data, fromJS] as const)[1];

  expect(createConst({ a: 'A' })).type.toEqual<Map<'a', string>>();
});
