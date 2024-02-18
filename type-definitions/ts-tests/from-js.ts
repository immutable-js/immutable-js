import { expectType } from 'tsd';
import { fromJS, List, Map, MapOf, Collection } from 'immutable';

{
  // fromJS

  expectType<Collection<unknown, unknown>>(fromJS({}, (a: any, b: any) => b));

  expectType<string>(fromJS('abc'));

  expectType<List<number>>(fromJS([0, 1, 2]));

  expectType<List<number>>(fromJS(List([0, 1, 2])));

  expectType<Map<"b" | "a" | "c", number>>(fromJS({ a: 0, b: 1, c: 2 }));

  expectType<MapOf<{ a: number; b: number; c: number; }>>(fromJS(Map({ a: 0, b: 1, c: 2 })));

  expectType<List<Map<"a", number>>>(fromJS([{ a: 0 }]));

  expectType<Map<"a", List<number>>>(fromJS({ a: [0] }));

  expectType<List<List<List<number>>>>(fromJS([[[0]]]));

  expectType<Map<"a", Map<"b", Map<"c", number>>>>(fromJS({ a: { b: { c: 0 } } }));
}

{
  // fromJS in an array of function

  const create = [(data: any) => data, fromJS][1];

  expectType<any>(create({ a: 'A' }));

  const createConst = ([(data: any) => data, fromJS] as const)[1];

  expectType<Map<"a", string>>(createConst({ a: 'A' }));
}
