import { expect, test } from 'tstyche';
import { Map, List, MapOf } from 'immutable';

test('#constructor', () => {
  expect(Map()).type.toEqual<Map<unknown, unknown>>();

  expect(Map<number, number>()).type.toEqual<Map<number, number>>();

  expect(Map([[1, 'a']])).type.toEqual<Map<number, string>>();

  expect(Map([['a', 'a']])).type.toEqual<Map<string, string>>();

  expect(Map(List<[number, string]>([[1, 'a']]))).type.toEqual<
    Map<number, string>
  >();

  expect(Map({ a: 1 })).type.toEqual<MapOf<{ a: number }>>();

  expect(Map({ a: 1, b: 'b' })).type.toEqual<MapOf<{ a: number; b: string }>>();

  expect(Map({ a: Map({ b: Map({ c: 3 }) }) })).type.toEqual<
    MapOf<{ a: MapOf<{ b: MapOf<{ c: number }> }> }>
  >();

  expect(Map<{ a: string }>({ a: 1 })).type.toRaiseError();

  expect(Map<{ a: string }>({ a: 'a', b: 'b' })).type.toRaiseError();

  expect(Map(List([List(['a', 'b'])]))).type.toEqual<
    MapOf<List<List<string>>>
  >();

  expect(Map<'status', string>({ status: 'paid' })).type.toEqual<
    Map<'status', string>
  >();

  expect(Map<'status' | 'amount', string>({ status: 'paid' })).type.toEqual<
    Map<'status' | 'amount', string>
  >();

  expect(
    Map<'status', string>({ status: 'paid', amount: 10 })
  ).type.toRaiseError();
});

test('#size', () => {
  expect(Map().size).type.toBeNumber();

  expect(Map()).type.toMatch<{ readonly size: number }>();
});

test('#get', () => {
  expect(Map<number, number>().get(4)).type.toEqual<number | undefined>();

  expect(Map<number, number>().get(4, 'a')).type.toEqual<number | 'a'>();

  expect(Map<number, number>().get<number>(4, 'a')).type.toRaiseError();

  expect(Map({ a: 4, b: true }).get('a')).type.toBeNumber();

  expect(Map({ a: 4, b: true }).get('b')).type.toBeBoolean();

  expect(
    Map({ a: Map({ b: true }) })
      .get('a')
      .get('b')
  ).type.toBeBoolean();

  expect(Map({ a: 4 }).get('b')).type.toRaiseError();

  expect(Map({ a: 4 }).get('b', undefined)).type.toBeUndefined();

  expect(Map({ 1: 4 }).get(1)).type.toBeNumber();

  expect(Map({ 1: 4 }).get(2)).type.toRaiseError();

  expect(Map({ 1: 4 }).get(2, 3)).type.toEqual<3>();

  const s1 = Symbol('s1');

  expect(Map({ [s1]: 4 }).get(s1)).type.toBeNumber();

  const s2 = Symbol('s2');

  expect(Map({ [s2]: 4 }).get(s1)).type.toRaiseError();
});

test('#getIn', () => {
  expect(Map({ a: 4, b: true }).getIn(['a' as const])).type.toBeNumber();

  expect(
    Map({ a: Map({ b: Map({ c: Map({ d: 4 }) }) }) }).getIn([
      'a' as const,
      'b' as const,
      'c' as const,
      'd' as const,
    ])
  ).type.toBeNumber();

  // currently `RetrievePathReducer` does not work with anything else than `MapOf`
  expect.fail(Map({ a: List([1]) }).getIn(['a' as const, 0])).type.toBeNumber();
});

test('#set', () => {
  expect(Map<number, number>().set(0, 0)).type.toEqual<Map<number, number>>();

  expect(Map<number, number>().set(1, 'a')).type.toRaiseError();

  expect(Map<number, number>().set('a', 1)).type.toRaiseError();

  expect(Map<number, number | string>().set(0, 1)).type.toEqual<
    Map<number, string | number>
  >();

  expect(Map<number, number | string>().set(0, 'a')).type.toEqual<
    Map<number, string | number>
  >();

  expect(Map({ a: 1 }).set('b', 'b')).type.toRaiseError();

  expect(Map<{ a: number; b?: string }>({ a: 1 }).set('b', 'b')).type.toEqual<
    MapOf<{ a: number; b?: string | undefined }>
  >();

  expect(
    Map<{ a: number; b?: string }>({ a: 1 }).set('b', undefined)
  ).type.toEqual<MapOf<{ a: number; b?: string | undefined }>>();

  expect(
    Map<{ a: number; b?: string }>({ a: 1 }).set('b', 'b').get('a')
  ).type.toBeNumber();

  expect(
    Map<{ a: number; b?: string }>({ a: 1 }).set('b', 'b').get('b')
  ).type.toEqual<string | undefined>();

  let customer = Map<{ phone: string | number }>({
    phone: 'bar',
  });

  expect(customer).type.toBeAssignable(customer.set('phone', 8));
});

test('#setIn', () => {
  expect(Map<number, number>().setIn([], 0)).type.toEqual<
    Map<number, number>
  >();
});

test('#delete', () => {
  expect(Map<number, number>().delete(0)).type.toEqual<Map<number, number>>();

  expect(Map<number, number>().delete('a')).type.toRaiseError();

  expect(Map({ a: 1, b: 'b' }).delete('b')).type.toBeNever();

  expect(
    Map<{ a: number; b?: string }>({ a: 1, b: 'b' }).delete('b')
  ).type.toEqual<MapOf<{ a: number; b?: string | undefined }>>();

  expect(
    Map<{ a?: number; b?: string }>({ a: 1, b: 'b' }).remove('b').delete('a')
  ).type.toEqual<MapOf<{ a?: number | undefined; b?: string | undefined }>>();

  expect(
    Map<{ a: number; b?: string }>({ a: 1, b: 'b' }).remove('b').get('a')
  ).type.toBeNumber();

  expect(
    Map<{ a: number; b?: string }>({ a: 1, b: 'b' }).remove('b').get('b')
  ).type.toEqual<string | undefined>();
});

test('#deleteAll', () => {
  expect(Map<number, number>().deleteAll([0])).type.toEqual<
    Map<number, number>
  >();

  expect(Map<number, number>().deleteAll([0, 'a'])).type.toRaiseError();
});

test('#deleteIn', () => {
  expect(Map<number, number>().deleteIn([])).type.toEqual<
    Map<number, number>
  >();
});

test('#remove', () => {
  expect(Map<number, number>().remove(0)).type.toEqual<Map<number, number>>();

  expect(Map<number, number>().remove('a')).type.toRaiseError();
});

test('#removeAll', () => {
  expect(Map<number, number>().removeAll([0])).type.toEqual<
    Map<number, number>
  >();

  expect(Map<number, number>().removeAll([0, 'a'])).type.toRaiseError();
});

test('#removeIn', () => {
  expect(Map<number, number>().removeIn([])).type.toEqual<
    Map<number, number>
  >();
});

test('#clear', () => {
  expect(Map<number, number>().clear()).type.toEqual<Map<number, number>>();

  expect(Map().clear(10)).type.toRaiseError();
});

test('#update', () => {
  expect(Map().update(v => 1)).type.toBeNumber();

  expect(
    Map<number, number>().update((v: Map<string> | undefined) => v)
  ).type.toRaiseError();

  expect(
    Map<number, number>().update(0, (v: number | undefined) => 0)
  ).type.toEqual<Map<number, number>>();

  expect(
    Map<number, number>().update(0, (v: number | undefined) => v + 'a')
  ).type.toRaiseError();

  expect(
    Map<number, number>().update(1, 10, (v: number | undefined) => 0)
  ).type.toEqual<Map<number, number>>();

  expect(
    Map<number, number>().update(1, 'a', (v: number | undefined) => 0)
  ).type.toRaiseError();

  expect(
    Map<number, number>().update(1, 10, (v: number | undefined) => v + 'a')
  ).type.toRaiseError();

  expect(Map({ a: 1, b: 'b' }).update('c', v => v)).type.toRaiseError();

  expect(Map({ a: 1, b: 'b' }).update('b', v => v.toUpperCase())).type.toEqual<
    MapOf<{ a: number; b: string }>
  >();

  expect(
    Map({ a: 1, b: 'b' }).update('b', 'NSV', v => v.toUpperCase())
  ).type.toEqual<MapOf<{ a: number; b: string }>>();

  expect(Map({ a: 1, b: 'b' }).update(v => ({ a: 'a' }))).type.toRaiseError();

  expect(
    Map({ a: 1, b: 'b' }).update(v => v.set('a', 2).set('b', 'B'))
  ).type.toEqual<MapOf<{ a: number; b: string }>>();

  expect(
    Map({ a: 1, b: 'b' }).update(v => v.set('c', 'c'))
  ).type.toRaiseError();

  expect(
    Map<string, string>().update('noKey', ls => ls?.toUpperCase())
  ).type.toEqual<Map<string, string>>();
});

test('#updateIn', () => {
  expect(Map<number, number>().updateIn([], v => v)).type.toEqual<
    Map<number, number>
  >();

  expect(Map<number, number>().updateIn([], 10)).type.toRaiseError();
});

test('#map', () => {
  expect(
    Map<number, number>().map(
      (value: number, key: number, iter: Map<number, number>) => 1
    )
  ).type.toEqual<Map<number, number>>();

  expect(
    Map<number, number>().map(
      (value: number, key: number, iter: Map<number, number>) => 'a'
    )
  ).type.toEqual<Map<number, string>>();

  expect(
    Map<number, number>().map<number>(
      (value: number, key: number, iter: Map<number, number>) => 1
    )
  ).type.toEqual<Map<number, number>>();

  expect(
    Map<number, number>().map<string>(
      (value: number, key: number, iter: Map<number, number>) => 1
    )
  ).type.toRaiseError();

  expect(
    Map<number, number>().map<number>(
      (value: string, key: number, iter: Map<number, number>) => 1
    )
  ).type.toRaiseError();

  expect(
    Map<number, number>().map<number>(
      (value: number, key: string, iter: Map<number, number>) => 1
    )
  ).type.toRaiseError();

  expect(
    Map<number, number>().map<number>(
      (value: number, key: number, iter: Map<number, string>) => 1
    )
  ).type.toRaiseError();

  expect(
    Map<number, number>().map<number>(
      (value: number, key: number, iter: Map<number, number>) => 'a'
    )
  ).type.toRaiseError();
});

test('#mapKeys', () => {
  expect(
    Map<number, number>().mapKeys(
      (value: number, key: number, iter: Map<number, number>) => 1
    )
  ).type.toEqual<Map<number, number>>();

  expect(
    Map<number, number>().mapKeys(
      (value: number, key: number, iter: Map<number, number>) => 'a'
    )
  ).type.toEqual<Map<string, number>>();

  expect(
    Map<number, number>().mapKeys<number>(
      (value: number, key: number, iter: Map<number, number>) => 1
    )
  ).type.toEqual<Map<number, number>>();

  expect(
    Map<number, number>().mapKeys<string>(
      (value: number, key: number, iter: Map<number, number>) => 1
    )
  ).type.toRaiseError();

  expect(
    Map<number, number>().mapKeys<number>(
      (value: string, key: number, iter: Map<number, number>) => 1
    )
  ).type.toRaiseError();

  expect(
    Map<number, number>().mapKeys<number>(
      (value: number, key: string, iter: Map<number, number>) => 1
    )
  ).type.toRaiseError();

  expect(
    Map<number, number>().mapKeys<number>(
      (value: number, key: number, iter: Map<number, string>) => 1
    )
  ).type.toRaiseError();

  expect(
    Map<number, number>().mapKeys<number>(
      (value: number, key: number, iter: Map<number, number>) => 'a'
    )
  ).type.toRaiseError();
});

test('#flatMap', () => {
  expect(
    Map<number, number>().flatMap(
      (value: number, key: number, iter: Map<number, number>) => [[0, 1]]
    )
  ).type.toEqual<Map<number, number>>();

  expect(
    Map<number, number>().flatMap(
      (value: number, key: number, iter: Map<number, number>) => [['a', 'b']]
    )
  ).type.toEqual<Map<string, string>>();

  expect(
    Map<number, number>().flatMap<number, number>(
      (value: number, key: number, iter: Map<number, number>) => [[0, 1]]
    )
  ).type.toEqual<Map<number, number>>();

  expect(
    Map<number, number>().flatMap<number, string>(
      (value: number, key: number, iter: Map<number, number>) => [[0, 1]]
    )
  ).type.toRaiseError();

  expect(
    Map<number, number>().flatMap<number, number>(
      (value: string, key: number, iter: Map<number, number>) => [[0, 1]]
    )
  ).type.toRaiseError();

  expect(
    Map<number, number>().flatMap<number, number>(
      (value: number, key: string, iter: Map<number, number>) => [[0, 1]]
    )
  ).type.toRaiseError();

  expect(
    Map<number, number>().flatMap<number, number>(
      (value: number, key: number, iter: Map<number, string>) => [[0, 1]]
    )
  ).type.toRaiseError();

  expect(
    Map<number, number>().flatMap<number, number>(
      (value: number, key: number, iter: Map<number, number>) => [[0, 'a']]
    )
  ).type.toRaiseError();
});

test('#merge', () => {
  expect(Map<string, number>().merge({ a: 1 })).type.toEqual<
    Map<string, number>
  >();

  expect(Map<string, number>().merge({ a: { b: 1 } })).type.toEqual<
    Map<string, number | { b: number }>
  >();

  expect(Map<number, number>().merge(Map<number, number>())).type.toEqual<
    Map<number, number>
  >();

  expect(Map<number, number>().merge(Map<number, string>())).type.toEqual<
    Map<number, string | number>
  >();

  expect(
    Map<number, number | string>().merge(Map<number, string>())
  ).type.toEqual<Map<number, string | number>>();

  expect(
    Map<number, number | string>().merge(Map<number, number>())
  ).type.toEqual<Map<number, string | number>>();

  expect(Map({ a: 1 }).merge(Map({ b: 2 }))).type.toEqual<
    Map<'b' | 'a', number>
  >();
});

test('#mergeIn', () => {
  expect(Map<number, number>().mergeIn([], [])).type.toEqual<
    Map<number, number>
  >();
});

test('#mergeWith', () => {
  expect(
    Map<number, number>().mergeWith(
      (prev: number, next: number, key: number) => 1,
      Map<number, number>()
    )
  ).type.toEqual<Map<number, number>>();

  expect(
    Map<number, number>().mergeWith(
      (prev: string, next: number, key: number) => 1,
      Map<number, number>()
    )
  ).type.toRaiseError();

  expect(
    Map<number, number>().mergeWith(
      (prev: number, next: string, key: number) => 1,
      Map<number, number>()
    )
  ).type.toRaiseError();

  expect(
    Map<number, number>().mergeWith(
      (prev: number, next: number, key: string) => 1,
      Map<number, number>()
    )
  ).type.toRaiseError();

  expect(
    Map<number, number>().mergeWith(
      (prev: number, next: number, key: number) => 'a',
      Map<number, number>()
    )
  ).type.toEqual<Map<number, string | number>>();

  expect(
    Map<number, number>().mergeWith(
      (prev: number, next: number, key: number) => 1,
      Map<number, string>()
    )
  ).type.toRaiseError();

  expect(
    Map<string, number>().mergeWith(
      (prev: number, next: number, key: string) => 1,
      { a: 1 }
    )
  ).type.toEqual<Map<string, number>>();

  expect(
    Map<string, number>().mergeWith(
      (prev: number, next: number, key: string) => 1,
      { a: 'a' }
    )
  ).type.toRaiseError();

  expect(
    Map<string, number>().mergeWith(
      (prev: number, next: number | string, key: string) => 1,
      { a: 'a' }
    )
  ).type.toEqual<Map<string, string | number>>();

  expect(
    Map<number, number | string>().mergeWith(
      (prev: number | string, next: number | string, key: number) => 1,
      Map<number, string>()
    )
  ).type.toEqual<Map<number, string | number>>();
});

test('#mergeDeep', () => {
  expect(Map<string, number>().mergeDeep({ a: 1 })).type.toEqual<
    Map<string, number>
  >();

  expect(Map<string, number>().mergeDeep({ a: { b: 1 } })).type.toEqual<
    Map<string, number | { b: number }>
  >();

  expect(Map<string, number>().mergeDeep(Map({ a: { b: 1 } }))).type.toEqual<
    Map<string, number | { b: number }>
  >();

  expect(Map<number, number>().mergeDeep(Map<number, number>())).type.toEqual<
    Map<number, number>
  >();

  expect(Map<number, number>().mergeDeep(Map<number, string>())).type.toEqual<
    Map<number, string | number>
  >();

  expect(
    Map<number, number | string>().mergeDeep(Map<number, string>())
  ).type.toEqual<Map<number, string | number>>();

  expect(
    Map<number, number | string>().mergeDeep(Map<number, number>())
  ).type.toEqual<Map<number, string | number>>();
});

test('#mergeDeepIn', () => {
  expect(Map<number, number>().mergeDeepIn([], [])).type.toEqual<
    Map<number, number>
  >();
});

test('#mergeDeepWith', () => {
  expect(
    Map<number, number>().mergeDeepWith(
      (prev: unknown, next: unknown, key: unknown) => 1,
      Map<number, number>()
    )
  ).type.toEqual<Map<number, number>>();

  expect(
    Map<number, number>().mergeDeepWith(
      (prev: unknown, next: unknown, key: unknown) => 1,
      Map<number, string>()
    )
  ).type.toRaiseError();

  expect(
    Map<string, number>().mergeDeepWith(
      (prev: unknown, next: unknown, key: unknown) => 1,
      { a: 1 }
    )
  ).type.toEqual<Map<string, number>>();

  expect(
    Map<string, number>().mergeDeepWith(
      (prev: unknown, next: unknown, key: unknown) => 1,
      { a: 'a' }
    )
  ).type.toRaiseError();

  expect(
    Map<number, number | string>().mergeDeepWith(
      (prev: unknown, next: unknown, key: unknown) => 1,
      Map<number, string>()
    )
  ).type.toEqual<Map<number, string | number>>();
});

test('#flip', () => {
  expect(Map<number, string>().flip()).type.toEqual<Map<string, number>>();
});

test('#withMutations', () => {
  expect(Map<number, number>().withMutations(mutable => mutable)).type.toEqual<
    Map<number, number>
  >();

  expect(
    Map<number, number>().withMutations((mutable: Map<string>) => mutable)
  ).type.toRaiseError();
});

test('#asMutable', () => {
  expect(Map<number, number>().asMutable()).type.toEqual<Map<number, number>>();
});

test('#asImmutable', () => {
  expect(Map<number, number>().asImmutable()).type.toEqual<
    Map<number, number>
  >();
});

test('#toJS', () => {
  expect(Map<number, number>().toJS()).type.toEqual<{
    [x: string]: number;
    [x: number]: number;
    [x: symbol]: number;
  }>();

  expect(Map({ a: 'A' }).toJS()).type.toEqual<{ a: string }>();

  expect(Map({ a: Map({ b: 'b' }) }).toJS()).type.toEqual<{
    a: { b: string };
  }>();
});

test('#toJSON', () => {
  expect(Map({ a: Map({ b: 'b' }) }).toJSON()).type.toEqual<{
    a: MapOf<{ b: string }>;
  }>();
});
