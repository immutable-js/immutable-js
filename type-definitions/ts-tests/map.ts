import { Map, List, MapOf } from 'immutable';

{
  // #constructor

  // $ExpectType Map<unknown, unknown>
  Map();

  // $ExpectType Map<number, number>
  Map<number, number>();

  // $ExpectType Map<number, string>
  Map([[1, 'a']]);

  // $ExpectType Map<string, string>
  Map([['a', 'a']]);

  // $ExpectType Map<number, string>
  Map(List<[number, string]>([[1, 'a']]));

  // $ExpectType MapOf<{ a: number; }>
  Map({ a: 1 });

  // $ExpectType MapOf<{ a: number; b: string; }>
  Map({ a: 1, b: 'b' });

  // $ExpectType MapOf<{ a: MapOf<{ b: MapOf<{ c: number; }>; }>; }>
  Map({ a: Map({ b: Map({ c: 3 }) }) });

  // $ExpectError
  Map<{ a: string }>({ a: 1 });

  // $ExpectError
  Map<{ a: string }>({ a: 'a', b: 'b' });

  // No longer works in typescript@>=3.9
  // // $ExpectError - TypeScript does not support Lists as tuples
  // Map(List([List(['a', 'b'])]));

  // $ExpectType Map<number, number>
  const numberMap: Map<number, number> = Map();

  // $ExpectType Map<"status", string>
  Map<'status', string>({ status: 'paid' });

  // $ExpectType Map<"status" | "amount", string>
  Map<'status' | 'amount', string>({ status: 'paid' });

  // $ExpectError
  Map<'status', string>({ status: 'paid', amount: 10 });
}

{
  // #size

  // $ExpectType number
  Map().size;

  // $ExpectError
  Map().size = 10;
}

{
  // #get

  // $ExpectType number | undefined
  Map<number, number>().get(4);

  // $ExpectType number | "a"
  Map<number, number>().get(4, 'a');

  // $ExpectError
  Map<number, number>().get<number>(4, 'a');

  // $ExpectType number
  Map({ a: 4, b: true }).get('a');

  // $ExpectType boolean
  Map({ a: 4, b: true }).get('b');

  // $ExpectType boolean
  Map({ a: Map({ b: true }) })
    .get('a')
    .get('b');

    // $ExpectError
    Map({ a: 4 }).get('b');

    // $ExpectType undefined
    Map({ a: 4 }).get('b', undefined);

    // $ExpectType number
    Map({ 1: 4 }).get(1);

    // $ExpectError
    Map({ 1: 4 }).get(2);

    // $ExpectType 3
    Map({ 1: 4 }).get(2, 3);

    const s = Symbol('s');

    // $ExpectType number
    Map({ [s]: 4 }).get(s);

    const s2 = Symbol('s2');

    // $ExpectError
    Map({ [s2]: 4 }).get(s);
}

{
  // Minimum TypeScript Version: 4.1
  // #getIn

  // $ExpectType number
  Map({ a: 4, b: true }).getIn(['a']);

  // $ExpectType number
  Map({ a: Map({ b: Map({ c: Map({ d: 4 }) }) }) }).getIn(['a', 'b', 'c', 'd']);

  // with a better type, it should be resolved to `number` in the future. `RetrievePathReducer` does not work with anything else than MapOf
  // $ExpectType never
  Map({ a: List([ 1 ]) }).getIn(['a', 0]);
}

{
  // #set

  // $ExpectType Map<number, number>
  Map<number, number>().set(0, 0);

  // $ExpectError
  Map<number, number>().set(1, 'a');

  // $ExpectError
  Map<number, number>().set('a', 1);

  // $ExpectType Map<number, string | number>
  Map<number, number | string>().set(0, 1);

  // $ExpectType Map<number, string | number>
  Map<number, number | string>().set(0, 'a');

  // $ExpectError
  Map({ a: 1 }).set('b', 'b');

  // $ExpectType MapOf<{ a: number; b?: string | undefined; }>
  Map<{ a: number; b?: string; }>({ a: 1 }).set('b', 'b');

  // $ExpectType MapOf<{ a: number; b?: string | undefined; }>
  Map<{ a: number; b?: string; }>({ a: 1 }).set('b', undefined);

  // $ExpectType number
  Map<{ a: number; b?: string }>({ a: 1 }).set('b', 'b').get('a');

  // $ExpectType string | undefined
  Map<{ a: number; b?: string }>({ a: 1 }).set('b', 'b').get('b');

  let customer = Map<{ phone: string | number }>({
    phone: 'bar',
  });

  // $ExpectType MapOf<{ phone: string | number; }>
  customer = customer.set('phone', 8);
}

{
  // #setIn

  // $ExpectType Map<number, number>
  Map<number, number>().setIn([], 0);
}

{
  // #delete

  // $ExpectType Map<number, number>
  Map<number, number>().delete(0);

  // $ExpectError
  Map<number, number>().delete('a');

  // $ExpectType never
  Map({ a: 1, b: 'b' }).delete('b');

  // $ExpectType MapOf<{ a: number; b?: string | undefined; }>
  Map<{ a: number; b?: string; }>({ a: 1, b: 'b' }).delete('b');

  // $ExpectType MapOf<{ a?: number | undefined; b?: string | undefined; }>
  Map<{ a?: number; b?: string; }>({ a: 1, b: 'b' }).remove('b').delete('a');

  // $ExpectType number
  Map<{ a: number; b?: string; }>({ a: 1, b: 'b' }).remove('b').get('a');

  // $ExpectType: string | undefined
  Map<{ a: number; b?: string; }>({ a: 1, b: 'b' }).remove('b').get('b');
}

{
  // #deleteAll

  // $ExpectType Map<number, number>
  Map<number, number>().deleteAll([0]);

  // $ExpectError
  Map<number, number>().deleteAll([0, 'a']);
}

{
  // #deleteIn

  // $ExpectType Map<number, number>
  Map<number, number>().deleteIn([]);
}

{
  // #remove

  // $ExpectType Map<number, number>
  Map<number, number>().remove(0);

  // $ExpectError
  Map<number, number>().remove('a');
}

{
  // #removeAll

  // $ExpectType Map<number, number>
  Map<number, number>().removeAll([0]);

  // $ExpectError
  Map<number, number>().removeAll([0, 'a']);
}

{
  // #removeIn

  // $ExpectType Map<number, number>
  Map<number, number>().removeIn([]);
}

{
  // #clear

  // $ExpectType Map<number, number>
  Map<number, number>().clear();

  // $ExpectError
  Map().clear(10);
}

{
  // #update

  // $ExpectType number
  Map().update((v) => 1);

  // $ExpectError
  Map<number, number>().update((v: Map<string> | undefined) => v);

  // $ExpectType Map<number, number>
  Map<number, number>().update(0, (v: number | undefined) => 0);

  // $ExpectError
  Map<number, number>().update(0, (v: number | undefined) => v + 'a');

  // $ExpectType Map<number, number>
  Map<number, number>().update(1, 10, (v: number | undefined) => 0);

  // $ExpectError
  Map<number, number>().update(1, 'a', (v: number | undefined) => 0);

  // $ExpectError
  Map<number, number>().update(1, 10, (v: number | undefined) => v + 'a');

  // $ExpectError
  Map({ a: 1, b: 'b' }).update('c', (v) => v);

  // $ExpectType MapOf<{ a: number; b: string; }>
  Map({ a: 1, b: 'b' }).update('b', (v) => v.toUpperCase());

  // $ExpectType MapOf<{ a: number; b: string; }>
  Map({ a: 1, b: 'b' }).update('b', 'NSV', (v) => v.toUpperCase());

  // $ExpectError
  Map({ a: 1, b: 'b' }).update((v) => ({ a: 'a' }));

  // $ExpectType MapOf<{ a: number; b: string; }>
  Map({ a: 1, b: 'b' }).update((v) => v.set('a', 2).set('b', 'B'));

  // $ExpectError
  Map({ a: 1, b: 'b' }).update((v) => v.set('c', 'c'));

  // $ExpectType Map<string, string>
  Map<string, string>().update("noKey", ls => ls?.toUpperCase());
}

{
  // #updateIn

  // $ExpectType Map<number, number>
  Map<number, number>().updateIn([], (v) => v);

  // $ExpectError
  Map<number, number>().updateIn([], 10);
}

{
  // #map

  // $ExpectType Map<number, number>
  Map<number, number>().map(
    (value: number, key: number, iter: Map<number, number>) => 1
  );

  // $ExpectType Map<number, string>
  Map<number, number>().map(
    (value: number, key: number, iter: Map<number, number>) => 'a'
  );

  // $ExpectType Map<number, number>
  Map<number, number>().map<number>(
    (value: number, key: number, iter: Map<number, number>) => 1
  );

  Map<number, number>().map<string>(
    // $ExpectError
    (value: number, key: number, iter: Map<number, number>) => 1
  );

  Map<number, number>().map<number>(
    // $ExpectError
    (value: string, key: number, iter: Map<number, number>) => 1
  );

  Map<number, number>().map<number>(
    // $ExpectError
    (value: number, key: string, iter: Map<number, number>) => 1
  );

  Map<number, number>().map<number>(
    // $ExpectError
    (value: number, key: number, iter: Map<number, string>) => 1
  );

  Map<number, number>().map<number>(
    // $ExpectError
    (value: number, key: number, iter: Map<number, number>) => 'a'
  );
}

{
  // #mapKeys

  // $ExpectType Map<number, number>
  Map<number, number>().mapKeys(
    (value: number, key: number, iter: Map<number, number>) => 1
  );

  // $ExpectType Map<string, number>
  Map<number, number>().mapKeys(
    (value: number, key: number, iter: Map<number, number>) => 'a'
  );

  // $ExpectType Map<number, number>
  Map<number, number>().mapKeys<number>(
    (value: number, key: number, iter: Map<number, number>) => 1
  );

  Map<number, number>().mapKeys<string>(
    // $ExpectError
    (value: number, key: number, iter: Map<number, number>) => 1
  );

  Map<number, number>().mapKeys<number>(
    // $ExpectError
    (value: string, key: number, iter: Map<number, number>) => 1
  );

  Map<number, number>().mapKeys<number>(
    // $ExpectError
    (value: number, key: string, iter: Map<number, number>) => 1
  );

  Map<number, number>().mapKeys<number>(
    // $ExpectError
    (value: number, key: number, iter: Map<number, string>) => 1
  );

  Map<number, number>().mapKeys<number>(
    // $ExpectError
    (value: number, key: number, iter: Map<number, number>) => 'a'
  );
}

{
  // #flatMap

  // $ExpectType Map<number, number>
  Map<number, number>().flatMap(
    (value: number, key: number, iter: Map<number, number>) => [[0, 1]]
  );

  // $ExpectType Map<string, string>
  Map<number, number>().flatMap(
    (value: number, key: number, iter: Map<number, number>) => [['a', 'b']]
  );

  // $ExpectType Map<number, number>
  Map<number, number>().flatMap<number, number>(
    (value: number, key: number, iter: Map<number, number>) => [[0, 1]]
  );

  Map<number, number>().flatMap<number, string>(
    // $ExpectError
    (value: number, key: number, iter: Map<number, number>) => [[0, 1]]
  );

  Map<number, number>().flatMap<number, number>(
    // $ExpectError
    (value: string, key: number, iter: Map<number, number>) => [[0, 1]]
  );

  Map<number, number>().flatMap<number, number>(
    // $ExpectError
    (value: number, key: string, iter: Map<number, number>) => [[0, 1]]
  );

  Map<number, number>().flatMap<number, number>(
    // $ExpectError
    (value: number, key: number, iter: Map<number, string>) => [[0, 1]]
  );

  Map<number, number>().flatMap<number, number>(
    // $ExpectError
    (value: number, key: number, iter: Map<number, number>) => [[0, 'a']]
  );
}

{
  // #merge

  // $ExpectType Map<string, number>
  Map<string, number>().merge({ a: 1 });

  // $ExpectType Map<string, number | { b: number; }>
  Map<string, number>().merge({ a: { b: 1 } });

  // $ExpectType Map<number, number>
  Map<number, number>().merge(Map<number, number>());

  // $ExpectType Map<number, string | number>
  Map<number, number>().merge(Map<number, string>());

  // $ExpectType Map<number, string | number>
  Map<number, number | string>().merge(Map<number, string>());

  // $ExpectType Map<number, string | number>
  Map<number, number | string>().merge(Map<number, number>());

  // $ExpectType Map<"b" | "a", number>
  Map({ a: 1 }).merge(Map({ b: 2 }));
}

{
  // #mergeIn

  // $ExpectType Map<number, number>
  Map<number, number>().mergeIn([], []);
}

{
  // #mergeWith

  // $ExpectType Map<number, number>
  Map<number, number>().mergeWith(
    (prev: number, next: number, key: number) => 1,
    Map<number, number>()
  );

  Map<number, number>().mergeWith(
    // $ExpectError
    (prev: string, next: number, key: number) => 1,
    Map<number, number>()
  );

  // $ExpectError
  Map<number, number>().mergeWith(
    (prev: number, next: string, key: number) => 1,
    Map<number, number>()
  );

  // $ExpectError
  Map<number, number>().mergeWith(
    (prev: number, next: number, key: string) => 1,
    Map<number, number>()
  );

  // $ExpectType Map<number, string | number>
  Map<number, number>().mergeWith(
    (prev: number, next: number, key: number) => 'a',
    Map<number, number>()
  );

  // $ExpectError
  Map<number, number>().mergeWith(
    (prev: number, next: number, key: number) => 1,
    Map<number, string>()
  );

  // $ExpectType Map<string, number>
  Map<string, number>().mergeWith(
    (prev: number, next: number, key: string) => 1,
    { a: 1 }
  );

  // $ExpectError
  Map<string, number>().mergeWith(
    (prev: number, next: number, key: string) => 1,
    { a: 'a' }
  );

  // $ExpectType Map<string, string | number>
  Map<string, number>().mergeWith(
    (prev: number, next: number | string, key: string) => 1,
    { a: 'a' }
  );

  // $ExpectType Map<number, string | number>
  Map<number, number | string>().mergeWith((prev: number | string, next: number | string, key: number) => 1, Map<number, string>());
}

{
  // #mergeDeep

  // $ExpectType Map<string, number>
  Map<string, number>().mergeDeep({ a: 1 });

  // $ExpectType Map<string, number | { b: number; }>
  Map<string, number>().mergeDeep({ a: { b: 1 } });

  // $ExpectType Map<string, number | { b: number; }>
  Map<string, number>().mergeDeep(Map({ a: { b: 1 } }));

  // $ExpectType Map<number, number>
  Map<number, number>().mergeDeep(Map<number, number>());

  // $ExpectType Map<number, string | number>
  Map<number, number>().mergeDeep(Map<number, string>());

  // $ExpectType Map<number, string | number>
  Map<number, number | string>().mergeDeep(Map<number, string>());

  // $ExpectType Map<number, string | number>
  Map<number, number | string>().mergeDeep(Map<number, number>());
}

{
  // #mergeDeepIn

  // $ExpectType Map<number, number>
  Map<number, number>().mergeDeepIn([], []);
}

{
  // #mergeDeepWith

  // $ExpectType Map<number, number>
  Map<number, number>().mergeDeepWith((prev: unknown, next: unknown, key: unknown) => 1, Map<number, number>());

  // $ExpectError
  Map<number, number>().mergeDeepWith((prev: unknown, next: unknown, key: unknown) => 1, Map<number, string>());

  // $ExpectType Map<string, number>
  Map<string, number>().mergeDeepWith((prev: unknown, next: unknown, key: unknown) => 1, { a: 1 });

  // $ExpectError
  Map<string, number>().mergeDeepWith((prev: unknown, next: unknown, key: unknown) => 1, { a: 'a' });

  // $ExpectType Map<number, string | number>
  Map<number, number | string>().mergeDeepWith((prev: unknown, next: unknown, key: unknown) => 1, Map<number, string>());
}

{
  // #flip

  // $ExpectType Map<string, number>
  Map<number, string>().flip();
}

{
  // #withMutations

  // $ExpectType Map<number, number>
  Map<number, number>().withMutations((mutable) => mutable);

  // $ExpectError
  Map<number, number>().withMutations((mutable: Map<string>) => mutable);
}

{
  // #asMutable

  // $ExpectType Map<number, number>
  Map<number, number>().asMutable();
}

{
  // #asImmutable

  // $ExpectType Map<number, number>
  Map<number, number>().asImmutable();
}

{
  // #toJS / #toJSON

  // $ExpectType { [x: string]: number; [x: number]: number; [x: symbol]: number; }
  Map<number, number>().toJS();

  // $ExpectType { a: string; }
  Map({ a: 'A' }).toJS();

  // $ExpectType { a: { b: string; }; }
  Map({ a: Map({ b: 'b' }) }).toJS();

  // $ExpectType { a: MapOf<{ b: string; }>; }
  Map({ a: Map({ b: 'b' }) }).toJSON();
}
