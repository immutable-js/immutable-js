import { expectType, expectAssignable, expectError } from 'tsd';
import { Map, List, MapOf } from 'immutable';

{
  // #constructor

  expectType<Map<unknown, unknown>>(Map());

  expectType<Map<number, number>>(Map<number, number>());

  expectType<Map<number, string>>(Map([[1, 'a']]));

  expectType<Map<string, string>>(Map([['a', 'a']]));

  expectType<Map<number, string>>(Map(List<[number, string]>([[1, 'a']])));

  expectType<MapOf<{ a: number }>>(Map({ a: 1 }));

  expectType<MapOf<{ a: number; b: string }>>(Map({ a: 1, b: 'b' }));

  expectType<MapOf<{ a: MapOf<{ b: MapOf<{ c: number }> }> }>>(
    Map({ a: Map({ b: Map({ c: 3 }) }) })
  );

  expectError(Map<{ a: string }>({ a: 1 }));

  expectError(Map<{ a: string }>({ a: 'a', b: 'b' }));

  // No longer works in typescript@>=3.9
  // TypeScript does not support Lists as tuples
  // expectError(Map(List([List(['a', 'b'])])));

  expectAssignable<Map<number, number>>(Map());

  expectType<Map<'status', string>>(Map<'status', string>({ status: 'paid' }));

  expectType<Map<'status' | 'amount', string>>(
    Map<'status' | 'amount', string>({ status: 'paid' })
  );

  expectError(Map<'status', string>({ status: 'paid', amount: 10 }));
}

{
  // #size

  expectType<number>(Map().size);

  expectError((Map().size = 10));
}

{
  // #get

  expectType<number | undefined>(Map<number, number>().get(4));

  expectType<number | 'a'>(Map<number, number>().get(4, 'a'));

  expectError(Map<number, number>().get<number>(4, 'a'));

  expectType<number>(Map({ a: 4, b: true }).get('a'));

  expectType<boolean>(Map({ a: 4, b: true }).get('b'));

  expectType<boolean>(
    Map({ a: Map({ b: true }) })
      .get('a')
      .get('b')
  );

  expectError(Map({ a: 4 }).get('b'));

  expectType<undefined>(Map({ a: 4 }).get('b', undefined));

  expectType<number>(Map({ 1: 4 }).get(1));

  expectError(Map({ 1: 4 }).get(2));

  expectType<3>(Map({ 1: 4 }).get(2, 3));

  const s = Symbol('s');

  expectType<number>(Map({ [s]: 4 }).get(s));

  const s2 = Symbol('s2');

  expectError(Map({ [s2]: 4 }).get(s));
}

{
  // Minimum TypeScript Version: 4.1
  // #getIn

  // FIXME: dtslint accepted these as `numbers` but tsc infers them as `never`
  expectType<never>(Map({ a: 4, b: true }).getIn(['a']));

  // FIXME: this one too
  expectType<never>(
    Map({ a: Map({ b: Map({ c: Map({ d: 4 }) }) }) }).getIn([
      'a',
      'b',
      'c',
      'd',
    ])
  );

  // with a better type, it should be resolved to `number` in the future. `RetrievePathReducer` does not work with anything else than MapOf
  expectType<never>(Map({ a: List([1]) }).getIn(['a', 0]));
}

{
  // #set

  expectType<Map<number, number>>(Map<number, number>().set(0, 0));

  expectError(Map<number, number>().set(1, 'a'));

  expectError(Map<number, number>().set('a', 1));

  expectType<Map<number, string | number>>(
    Map<number, number | string>().set(0, 1)
  );

  expectType<Map<number, string | number>>(
    Map<number, number | string>().set(0, 'a')
  );

  expectError(Map({ a: 1 }).set('b', 'b'));

  expectType<MapOf<{ a: number; b?: string | undefined }>>(
    Map<{ a: number; b?: string }>({ a: 1 }).set('b', 'b')
  );

  expectType<MapOf<{ a: number; b?: string | undefined }>>(
    Map<{ a: number; b?: string }>({ a: 1 }).set('b', undefined)
  );

  expectType<number>(
    Map<{ a: number; b?: string }>({ a: 1 }).set('b', 'b').get('a')
  );

  expectType<string | undefined>(
    Map<{ a: number; b?: string }>({ a: 1 }).set('b', 'b').get('b')
  );

  let customer = Map<{ phone: string | number }>({
    phone: 'bar',
  });

  expectType<MapOf<{ phone: string | number }>>(
    (customer = customer.set('phone', 8))
  );
}

{
  // #setIn

  expectType<Map<number, number>>(Map<number, number>().setIn([], 0));
}

{
  // #delete

  expectType<Map<number, number>>(Map<number, number>().delete(0));

  expectError(Map<number, number>().delete('a'));

  expectType<never>(Map({ a: 1, b: 'b' }).delete('b'));

  expectType<MapOf<{ a: number; b?: string | undefined }>>(
    Map<{ a: number; b?: string }>({ a: 1, b: 'b' }).delete('b')
  );

  expectType<MapOf<{ a?: number | undefined; b?: string | undefined }>>(
    Map<{ a?: number; b?: string }>({ a: 1, b: 'b' }).remove('b').delete('a')
  );

  expectType<number>(
    Map<{ a: number; b?: string }>({ a: 1, b: 'b' }).remove('b').get('a')
  );

  expectType<string | undefined>(
    Map<{ a: number; b?: string }>({ a: 1, b: 'b' }).remove('b').get('b')
  );
}

{
  // #deleteAll

  expectType<Map<number, number>>(Map<number, number>().deleteAll([0]));

  expectError(Map<number, number>().deleteAll([0, 'a']));
}

{
  // #deleteIn

  expectType<Map<number, number>>(Map<number, number>().deleteIn([]));
}

{
  // #remove

  expectType<Map<number, number>>(Map<number, number>().remove(0));

  expectError(Map<number, number>().remove('a'));
}

{
  // #removeAll

  expectType<Map<number, number>>(Map<number, number>().removeAll([0]));

  expectError(Map<number, number>().removeAll([0, 'a']));
}

{
  // #removeIn

  expectType<Map<number, number>>(Map<number, number>().removeIn([]));
}

{
  // #clear

  expectType<Map<number, number>>(Map<number, number>().clear());

  expectError(Map().clear(10));
}

{
  // #update

  expectType<number>(Map().update(v => 1));

  expectError(Map<number, number>().update((v: Map<string> | undefined) => v));

  expectType<Map<number, number>>(
    Map<number, number>().update(0, (v: number | undefined) => 0)
  );

  expectError(
    Map<number, number>().update(0, (v: number | undefined) => v + 'a')
  );

  expectType<Map<number, number>>(
    Map<number, number>().update(1, 10, (v: number | undefined) => 0)
  );

  expectError(
    Map<number, number>().update(1, 'a', (v: number | undefined) => 0)
  );

  expectError(
    Map<number, number>().update(1, 10, (v: number | undefined) => v + 'a')
  );

  expectError(Map({ a: 1, b: 'b' }).update('c', v => v));

  expectType<MapOf<{ a: number; b: string }>>(
    Map({ a: 1, b: 'b' }).update('b', v => v.toUpperCase())
  );

  expectType<MapOf<{ a: number; b: string }>>(
    Map({ a: 1, b: 'b' }).update('b', 'NSV', v => v.toUpperCase())
  );

  // FIXME: This error is not supported by tsd
  // tsd: `Found an error that tsd does not currently support (ts2740), consider creating an issue on GitHub.`
  // a pull request fixing the error has been made: https://github.com/tsdjs/tsd/pull/208
  // expectError(Map({ a: 1, b: 'b' }).update(v => ({ a: 'a' })));

  expectType<MapOf<{ a: number; b: string }>>(
    Map({ a: 1, b: 'b' }).update(v => v.set('a', 2).set('b', 'B'))
  );

  expectError(Map({ a: 1, b: 'b' }).update(v => v.set('c', 'c')));

  expectType<Map<string, string>>(
    Map<string, string>().update('noKey', ls => ls?.toUpperCase())
  );
}

{
  // #updateIn

  expectType<Map<number, number>>(Map<number, number>().updateIn([], v => v));

  expectError(Map<number, number>().updateIn([], 10));
}

{
  // #map

  expectType<Map<number, number>>(
    Map<number, number>().map(
      (value: number, key: number, iter: Map<number, number>) => 1
    )
  );

  expectType<Map<number, string>>(
    Map<number, number>().map(
      (value: number, key: number, iter: Map<number, number>) => 'a'
    )
  );

  expectType<Map<number, number>>(
    Map<number, number>().map<number>(
      (value: number, key: number, iter: Map<number, number>) => 1
    )
  );

  expectError(
    Map<number, number>().map<string>(
      (value: number, key: number, iter: Map<number, number>) => 1
    )
  );

  expectError(
    Map<number, number>().map<number>(
      (value: string, key: number, iter: Map<number, number>) => 1
    )
  );

  expectError(
    Map<number, number>().map<number>(
      (value: number, key: string, iter: Map<number, number>) => 1
    )
  );

  expectError(
    Map<number, number>().map<number>(
      (value: number, key: number, iter: Map<number, string>) => 1
    )
  );

  expectError(
    Map<number, number>().map<number>(
      (value: number, key: number, iter: Map<number, number>) => 'a'
    )
  );
}

{
  // #mapKeys

  expectType<Map<number, number>>(
    Map<number, number>().mapKeys(
      (value: number, key: number, iter: Map<number, number>) => 1
    )
  );

  expectType<Map<string, number>>(
    Map<number, number>().mapKeys(
      (value: number, key: number, iter: Map<number, number>) => 'a'
    )
  );

  expectType<Map<number, number>>(
    Map<number, number>().mapKeys<number>(
      (value: number, key: number, iter: Map<number, number>) => 1
    )
  );

  expectError(
    Map<number, number>().mapKeys<string>(
      (value: number, key: number, iter: Map<number, number>) => 1
    )
  );

  expectError(
    Map<number, number>().mapKeys<number>(
      (value: string, key: number, iter: Map<number, number>) => 1
    )
  );

  expectError(
    Map<number, number>().mapKeys<number>(
      (value: number, key: string, iter: Map<number, number>) => 1
    )
  );

  expectError(
    Map<number, number>().mapKeys<number>(
      (value: number, key: number, iter: Map<number, string>) => 1
    )
  );

  expectError(
    Map<number, number>().mapKeys<number>(
      (value: number, key: number, iter: Map<number, number>) => 'a'
    )
  );
}

{
  // #flatMap

  expectType<Map<number, number>>(
    Map<number, number>().flatMap(
      (value: number, key: number, iter: Map<number, number>) => [[0, 1]]
    )
  );

  expectType<Map<string, string>>(
    Map<number, number>().flatMap(
      (value: number, key: number, iter: Map<number, number>) => [['a', 'b']]
    )
  );

  expectType<Map<number, number>>(
    Map<number, number>().flatMap<number, number>(
      (value: number, key: number, iter: Map<number, number>) => [[0, 1]]
    )
  );

  expectError(
    Map<number, number>().flatMap<number, string>(
      (value: number, key: number, iter: Map<number, number>) => [[0, 1]]
    )
  );

  expectError(
    Map<number, number>().flatMap<number, number>(
      (value: string, key: number, iter: Map<number, number>) => [[0, 1]]
    )
  );

  expectError(
    Map<number, number>().flatMap<number, number>(
      (value: number, key: string, iter: Map<number, number>) => [[0, 1]]
    )
  );

  expectError(
    Map<number, number>().flatMap<number, number>(
      (value: number, key: number, iter: Map<number, string>) => [[0, 1]]
    )
  );

  expectError(
    Map<number, number>().flatMap<number, number>(
      (value: number, key: number, iter: Map<number, number>) => [[0, 'a']]
    )
  );
}

{
  // #merge

  expectType<Map<string, number>>(Map<string, number>().merge({ a: 1 }));

  expectType<Map<string, number | { b: number }>>(
    Map<string, number>().merge({ a: { b: 1 } })
  );

  expectType<Map<number, number>>(
    Map<number, number>().merge(Map<number, number>())
  );

  expectType<Map<number, string | number>>(
    Map<number, number>().merge(Map<number, string>())
  );

  expectType<Map<number, string | number>>(
    Map<number, number | string>().merge(Map<number, string>())
  );

  expectType<Map<number, string | number>>(
    Map<number, number | string>().merge(Map<number, number>())
  );

  expectType<Map<'b' | 'a', number>>(Map({ a: 1 }).merge(Map({ b: 2 })));
}

{
  // #mergeIn

  expectType<Map<number, number>>(Map<number, number>().mergeIn([], []));
}

{
  // #mergeWith

  expectType<Map<number, number>>(
    Map<number, number>().mergeWith(
      (prev: number, next: number, key: number) => 1,
      Map<number, number>()
    )
  );

  expectError(
    Map<number, number>().mergeWith(
      (prev: string, next: number, key: number) => 1,
      Map<number, number>()
    )
  );

  expectError(
    Map<number, number>().mergeWith(
      (prev: number, next: string, key: number) => 1,
      Map<number, number>()
    )
  );

  expectError(
    Map<number, number>().mergeWith(
      (prev: number, next: number, key: string) => 1,
      Map<number, number>()
    )
  );

  expectType<Map<number, string | number>>(
    Map<number, number>().mergeWith(
      (prev: number, next: number, key: number) => 'a',
      Map<number, number>()
    )
  );

  expectError(
    Map<number, number>().mergeWith(
      (prev: number, next: number, key: number) => 1,
      Map<number, string>()
    )
  );

  expectType<Map<string, number>>(
    Map<string, number>().mergeWith(
      (prev: number, next: number, key: string) => 1,
      { a: 1 }
    )
  );

  expectError(
    Map<string, number>().mergeWith(
      (prev: number, next: number, key: string) => 1,
      { a: 'a' }
    )
  );

  expectType<Map<string, string | number>>(
    Map<string, number>().mergeWith(
      (prev: number, next: number | string, key: string) => 1,
      { a: 'a' }
    )
  );

  expectType<Map<number, string | number>>(
    Map<number, number | string>().mergeWith(
      (prev: number | string, next: number | string, key: number) => 1,
      Map<number, string>()
    )
  );
}

{
  // #mergeDeep

  expectType<Map<string, number>>(Map<string, number>().mergeDeep({ a: 1 }));

  expectType<Map<string, number | { b: number }>>(
    Map<string, number>().mergeDeep({ a: { b: 1 } })
  );

  expectType<Map<string, number | { b: number }>>(
    Map<string, number>().mergeDeep(Map({ a: { b: 1 } }))
  );

  expectType<Map<number, number>>(
    Map<number, number>().mergeDeep(Map<number, number>())
  );

  expectType<Map<number, string | number>>(
    Map<number, number>().mergeDeep(Map<number, string>())
  );

  expectType<Map<number, string | number>>(
    Map<number, number | string>().mergeDeep(Map<number, string>())
  );

  expectType<Map<number, string | number>>(
    Map<number, number | string>().mergeDeep(Map<number, number>())
  );
}

{
  // #mergeDeepIn

  expectType<Map<number, number>>(Map<number, number>().mergeDeepIn([], []));
}

{
  // #mergeDeepWith

  expectType<Map<number, number>>(
    Map<number, number>().mergeDeepWith(
      (prev: unknown, next: unknown, key: unknown) => 1,
      Map<number, number>()
    )
  );

  expectError(
    Map<number, number>().mergeDeepWith(
      (prev: unknown, next: unknown, key: unknown) => 1,
      Map<number, string>()
    )
  );

  expectType<Map<string, number>>(
    Map<string, number>().mergeDeepWith(
      (prev: unknown, next: unknown, key: unknown) => 1,
      { a: 1 }
    )
  );

  expectError(
    Map<string, number>().mergeDeepWith(
      (prev: unknown, next: unknown, key: unknown) => 1,
      { a: 'a' }
    )
  );

  expectType<Map<number, string | number>>(
    Map<number, number | string>().mergeDeepWith(
      (prev: unknown, next: unknown, key: unknown) => 1,
      Map<number, string>()
    )
  );
}

{
  // #flip

  expectType<Map<string, number>>(Map<number, string>().flip());
}

{
  // #withMutations

  expectType<Map<number, number>>(
    Map<number, number>().withMutations(mutable => mutable)
  );

  expectError(
    Map<number, number>().withMutations((mutable: Map<string>) => mutable)
  );
}

{
  // #asMutable

  expectType<Map<number, number>>(Map<number, number>().asMutable());
}

{
  // #asImmutable

  expectType<Map<number, number>>(Map<number, number>().asImmutable());
}

{
  // #toJS / #toJSON

  expectType<{ [x: string]: number; [x: number]: number; [x: symbol]: number }>(
    Map<number, number>().toJS()
  );

  expectType<{ a: string }>(Map({ a: 'A' }).toJS());

  expectType<{ a: { b: string } }>(Map({ a: Map({ b: 'b' }) }).toJS());

  expectType<{ a: MapOf<{ b: string }> }>(Map({ a: Map({ b: 'b' }) }).toJSON());
}
