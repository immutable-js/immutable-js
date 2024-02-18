import { fromJS, List, Map } from 'immutable';

{
  // fromJS

  // $ExpectType Collection<unknown, unknown>
  fromJS({}, (a: any, b: any) => b);

  // $ExpectType string
  fromJS('abc');

  // $ExpectType List<number>
  fromJS([0, 1, 2]);

  // $ExpectType List<number>
  fromJS(List([0, 1, 2]));

  // $ExpectType Map<"b" | "a" | "c", number>
  fromJS({ a: 0, b: 1, c: 2 });

  // $ExpectType MapOf<{ a: number; b: number; c: number; }>
  fromJS(Map({ a: 0, b: 1, c: 2 }));

  // $ExpectType List<Map<"a", number>>
  fromJS([{ a: 0 }]);

  // $ExpectType Map<"a", List<number>>
  fromJS({ a: [0] });

  // $ExpectType List<List<List<number>>>
  fromJS([[[0]]]);

  // $ExpectType Map<"a", Map<"b", Map<"c", number>>>
  fromJS({ a: { b: { c: 0 } } });
}

{
  // fromJS in an array of function

  const create = [(data: any) => data, fromJS][1];

  // $ExpectType any
  create({ a: 'A' });

  const createConst = ([(data: any) => data, fromJS] as const)[1];

  // $ExpectType Map<"a", string>
  createConst({ a: 'A' });
}
