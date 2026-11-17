import {
  List,
  Map,
  MapOf,
  OrderedMap,
  OrderedSet,
  Record as ImmutableRecord,
  Set,
} from 'immutable';
import { expect, pick, test } from 'tstyche';

test('#constructor', () => {
  expect(Map()).type.toBe<Map<unknown, unknown>>();

  expect(Map<number, number>()).type.toBe<Map<number, number>>();

  expect(Map([[1, 'a']])).type.toBe<Map<number, string>>();

  expect(Map([['a', 'a']])).type.toBe<Map<string, string>>();

  expect(Map([] as ReadonlyArray<readonly [number, string]>)).type.toBe<
    Map<number, string>
  >();

  expect(Map(List<[number, string]>([[1, 'a']]))).type.toBe<
    Map<number, string>
  >();

  expect(Map({ a: 1 })).type.toBe<MapOf<{ a: number }>>();

  expect(Map({ a: 1, b: 'b' })).type.toBe<MapOf<{ a: number; b: string }>>();

  expect(Map({ a: Map({ b: Map({ c: 3 }) }) })).type.toBe<
    MapOf<{ a: MapOf<{ b: MapOf<{ c: number }> }> }>
  >();

  expect(Map<{ a: string }>({ a: 1 })).type.toRaiseError();

  expect(Map<{ a: string }>({ a: 'a', b: 'b' })).type.toRaiseError();

  // TODO this type is really weird, it should be `Map<string, string>` or MapOf<{ a: string }> See https://github.com/immutable-js/immutable-js/pull/1991#discussion_r1510863932
  expect(Map(List([List(['a', 'b'])]))).type.toBe<MapOf<List<List<string>>>>();

  expect(Map([[1, 'a']])).type.not.toBeAssignableTo<Map<number, number>>();

  expect(Map<'status', string>({ status: 'paid' })).type.toBe<
    Map<'status', string>
  >();

  expect(Map<'status' | 'amount', string>({ status: 'paid' })).type.toBe<
    Map<'status' | 'amount', string>
  >();

  expect(
    Map<'status', string>({ status: 'paid', amount: 10 })
  ).type.toRaiseError();
});

test('#size', () => {
  expect(pick(Map(), 'size')).type.toBe<{ readonly size: number }>();
});

test('#get', () => {
  expect(Map<number, number>().get(4)).type.toBe<number | undefined>();

  expect(Map<number, number>().get(4, 'a')).type.toBe<number | 'a'>();

  expect(Map<number, number>().get<number>(4, 'a')).type.toRaiseError();

  expect(Map({ a: 4, b: true }).get('a')).type.toBe<number>();

  expect(Map({ a: 4, b: true }).get('b')).type.toBe<boolean>();

  expect(
    Map({ a: Map({ b: true }) })
      .get('a')
      .get('b')
  ).type.toBe<boolean>();

  expect(Map({ a: 4 }).get('b')).type.toRaiseError();

  expect(Map({ a: 4 }).get('b', undefined)).type.toBe<undefined>();

  expect(Map({ 1: 4 }).get(1)).type.toBe<number>();

  expect(Map({ 1: 4 }).get(2)).type.toRaiseError();

  expect(Map({ 1: 4 }).get(2, 3)).type.toBe<3>();

  const s1 = Symbol('s1');

  expect(Map({ [s1]: 4 }).get(s1)).type.toBe<number>();

  const s2 = Symbol('s2');

  expect(Map({ [s2]: 4 }).get(s1)).type.toRaiseError();
});

test('#getIn', () => {
  const result = Map({ a: 4, b: true }).getIn(['a']);

  expect(result).type.toBe<number>();

  expect(Map({ a: 4, b: true }).getIn(['a'])).type.toBe<number>();

  expect(
    Map({ a: Map({ b: Map({ c: Map({ d: 4 }) }) }) }).getIn([
      'a',
      'b',
      'c',
      'd',
    ])
  ).type.toBe<number>();

  expect(Map({ a: [1] }).getIn(['a', 0])).type.toBe<number>();

  // like with `get`, the index of a List may be missing
  expect(Map({ a: List([1]) }).getIn(['a', 0])).type.toBe<number | undefined>();

  // a value on the way may be missing
  expect(
    Map<{ a: { b: string } | null }>({ a: null }).getIn(['a', 'b'])
  ).type.toBe<string | undefined>();

  expect(Map<{ a?: { b: string } }>({}).getIn(['a', 'b'])).type.toBe<
    string | undefined
  >();

  // a Map with unknown keys on the way: like with `get`, the key may be missing
  expect(Map({ a: Map<string, number>() }).getIn(['a', 'b'])).type.toBe<
    number | undefined
  >();

  expect(Map({ a: Map<string, number>() }).getIn(['a', 'b'], null)).type.toBe<
    number | null
  >();

  // a union of objects on the way: only some of them have the key
  const union = Map({ a: { b: 1 } as { b: number } | { c: string } });

  expect(union.getIn(['a', 'b'])).type.toBe<number | undefined>();

  expect(union.getIn(['a', 'b'], 'nsv')).type.toBe<number | 'nsv'>();

  expect(union.getIn(['a', 'z'])).type.toRaiseError('expected one of');

  // an object as a key, like the key of a `Map<object, V>`: the types do not follow it
  const objectKey = { id: 1 };
  const byObject = Map({ a: Map<{ id: number }, string>() });

  expect(byObject.getIn(['a', objectKey])).type.toBe<unknown>();

  expect(byObject.getIn(['a', objectKey], 'nsv')).type.toBe<unknown>();

  // the keys before it are still checked
  expect(byObject.getIn(['z', objectKey])).type.toRaiseError('expected one of');

  // a `Map<object, V>` that may be missing
  const maybeByObject = Map({
    a: null as Map<{ id: number }, string> | null,
  });

  expect(maybeByObject.getIn(['a', objectKey])).type.toBe<unknown>();

  // it is refused where no key can be an object
  expect(Map({ a: 1 }).getIn([objectKey])).type.toRaiseError('expected one of');

  expect(Map({ a: List([1]) }).getIn(['a', objectKey])).type.toRaiseError(
    'expected one of'
  );

  // `any` is not an object key
  const anyKey = 'b' as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  expect(Map({ a: { b: 1 } }).getIn(['z', anyKey])).type.toRaiseError(
    'expected one of'
  );

  // a generic Map or key: the path can not be checked
  function genericMap<T extends { a: { b: number } }>(map: MapOf<T>) {
    return map.getIn(['a', 'b']);
  }

  expect(genericMap(Map({ a: { b: 1 } }))).type.toBe<number>();

  function nestedGenericMap<T extends { a: { b: number } }>(
    map: MapOf<{ nested: MapOf<T> }>
  ) {
    return map.getIn(['nested', 'a', 'b']);
  }

  expect(
    nestedGenericMap(Map({ nested: Map({ a: { b: 1 } }) }))
  ).type.toBe<number>();

  function genericKey<K extends 'a' | 'b'>(key: K) {
    return Map({ a: 1, b: 'b' }).getIn([key]);
  }

  expect(genericKey('a')).type.toBe<number>();

  // a Record on the way: its properties are the keys, not its methods
  const Point = ImmutableRecord({ x: 0 });

  expect(Map({ p: Point() }).getIn(['p', 'x'])).type.toBe<number>();

  expect(Map({ p: Point() }).getIn(['p', 'get'])).type.toRaiseError(
    'expected one of'
  );

  // an invalid path is a type error
  expect(Map({ a: 4 }).getIn(['b'])).type.toRaiseError('expected one of');

  // nothing can be read below a primitive
  expect(Map({ a: 4 }).getIn(['a', 'b'])).type.toRaiseError(
    'no key can be read from'
  );

  // unless a `notSetValue` is given: it is then the result
  expect(Map({ a: 4 }).getIn(['b'], 'nsv')).type.toBe<'nsv'>();

  // with a `notSetValue`, it replaces the `undefined` of a missing value on the way
  expect(
    Map<{ a: { b: string } | null }>({ a: null }).getIn(['a', 'b'], 'nsv')
  ).type.toBe<string | 'nsv'>();

  // the `undefined` of the value itself stays, as the runtime gives it back
  expect(Map<{ a?: { b: string } }>({}).getIn(['a'], 'nsv')).type.toBe<
    { b: string } | undefined | 'nsv'
  >();

  // a path only known at runtime
  const path: Array<string> = ['a'];

  expect(Map({ a: 4 }).getIn(path)).type.toBe<unknown>();

  expect(Map({ a: 4 }).getIn(List(['a']))).type.toBe<unknown>();

  const readonlyPath: ReadonlyArray<string> = ['a'];

  expect(Map({ a: 4 }).getIn(readonlyPath)).type.toBe<unknown>();

  // a path given `as const`
  const constPath = ['a', 'b'] as const;

  expect(Map({ a: { b: 'x' } }).getIn(constPath)).type.toBe<string>();

  // an iterable which is neither an array nor an ordered collection is a type error
  const iterablePath: Iterable<string> = ['a'];

  expect(Map({ a: 4 }).getIn(iterablePath)).type.toRaiseError();

  // a key that may be `null` is a type error: the caller has to narrow it
  const maybeKey = 'b' as string | null;

  expect(Map({ a: { b: 1 } }).getIn(['a', maybeKey])).type.toRaiseError();
});

test('#getIn through a Set', () => {
  // a value of a Set is its own key
  const tags = Map({
    ids: Set([1, 2]),
    names: OrderedSet(['a']),
    users: Set([{ id: 1 }]),
  });

  expect(tags.getIn(['ids', 2])).type.toBe<number | undefined>();
  expect(tags.getIn(['names', 'a'])).type.toBe<string | undefined>();
  expect(tags.getIn(['ids', 'a'])).type.toRaiseError('expected one of');
  expect(tags.getIn(['ids', 2, 'a'])).type.toRaiseError(
    'no key can be read from'
  );

  // an object as a value: the types do not follow it, as for a `Map<object, V>`
  expect(tags.getIn(['users', { id: 1 }])).type.toBe<unknown>();

  expect(tags.removeIn(['ids', 2])).type.toBe<typeof tags>();
  expect(tags.hasIn(['names', 'b'])).type.toBe<boolean>();
});

test('#set', () => {
  expect(Map<number, number>().set(0, 0)).type.toBe<Map<number, number>>();

  expect(Map<number, number>().set(1, 'a')).type.toRaiseError();

  expect(Map<number, number>().set('a', 1)).type.toRaiseError();

  expect(Map<number, number | string>().set(0, 1)).type.toBe<
    Map<number, string | number>
  >();

  expect(Map<number, number | string>().set(0, 'a')).type.toBe<
    Map<number, string | number>
  >();

  expect(Map({ a: 1 }).set('b', 'b')).type.toRaiseError();

  expect(Map<{ a: number; b?: string }>({ a: 1 }).set('b', 'b')).type.toBe<
    MapOf<{ a: number; b?: string | undefined }>
  >();

  expect(
    Map<{ a: number; b?: string }>({ a: 1 }).set('b', undefined)
  ).type.toBe<MapOf<{ a: number; b?: string | undefined }>>();

  expect(
    Map<{ a: number; b?: string }>({ a: 1 }).set('b', 'b').get('a')
  ).type.toBe<number>();

  expect(
    Map<{ a: number; b?: string }>({ a: 1 }).set('b', 'b').get('b')
  ).type.toBe<string | undefined>();

  const customer = Map<{ phone: string | number }>({
    phone: 'bar',
  });

  expect(customer.set('phone', 8)).type.toBeAssignableTo(customer);
});

test('#setIn', () => {
  expect(Map<number, number>().setIn([], 0)).type.toBe<Map<number, number>>();

  // on a `MapOf`, the path and the value are typed, like `getIn`
  const user = Map({ name: 'a', address: Map({ city: 'b' }) });

  expect(user.setIn(['address', 'city'], 'c')).type.toBe<typeof user>();
  expect(user.setIn(['address', 'citi'], 'c')).type.toRaiseError(
    'expected one of'
  );
  expect(user.setIn(['address', 'city'], 1)).type.toRaiseError();

  // a value on the way that may be missing still takes the declared type
  const maybe = Map<{ a: { b: number } | undefined }>({ a: undefined });

  expect(maybe.setIn(['a', 'b'], 1)).type.toBe<typeof maybe>();
  expect(maybe.setIn(['a', 'b'], 'x')).type.toRaiseError();

  // a path only known at runtime takes any value
  const path: Array<string> = ['address', 'city'];

  expect(user.setIn(path, 1)).type.toBe<typeof user>();
  expect(user.setIn(List(['address', 'city']), 1)).type.toBe<typeof user>();
});

test('#delete', () => {
  expect(Map<number, number>().delete(0)).type.toBe<Map<number, number>>();

  expect(Map<number, number>().delete('a')).type.toRaiseError();

  expect(Map({ a: 1, b: 'b' }).delete('b')).type.toBe<MapOf<{ a: number }>>();

  expect(Map({ a: 1, b: 'b' }).delete('b').get('a')).type.toBe<number>();

  expect(Map({ a: 1, b: 'b' }).delete('b').get('b')).type.toRaiseError();

  expect(Map({ a: 1, b: 'b' }).delete('b').delete('a')).type.toBe<
    MapOf<Record<never, never>>
  >();

  expect(Map({ a: 1, b: 'b' }).delete('b').toJS()).type.toBe<{ a: number }>();

  expect(Map({ a: 1, b: 'b' }).delete('c')).type.toRaiseError();

  expect(Map<{ a: number; b?: string }>({ a: 1 }).delete('a')).type.toBe<
    MapOf<{ b?: string | undefined }>
  >();

  expect(Map({ a: 1, b: 'b' }).delete('b')).type.toBeAssignableTo<
    Map<'a', number>
  >();

  const sorted = Map<{ a: string; b?: string }>({ a: 'a' }).sort();

  expect(sorted.delete('b')).type.toBe<typeof sorted>();

  expect(
    Map<{ a: number; b?: string }>({ a: 1 }).delete('a').set('b', 'b')
  ).type.toBe<MapOf<{ b?: string | undefined }>>();

  expect(
    Map<{ a: number; b?: string }>({ a: 1, b: 'b' }).delete('b')
  ).type.toBe<MapOf<{ a: number; b?: string | undefined }>>();

  expect(
    Map<{ a?: number; b?: string }>({ a: 1, b: 'b' }).remove('b').delete('a')
  ).type.toBe<MapOf<{ a?: number | undefined; b?: string | undefined }>>();

  expect(
    Map<{ a: number; b?: string }>({ a: 1, b: 'b' }).remove('b').get('a')
  ).type.toBe<number>();

  expect(
    Map<{ a: number; b?: string }>({ a: 1, b: 'b' }).remove('b').get('b')
  ).type.toBe<string | undefined>();
});

test('#deleteAll', () => {
  expect(Map<number, number>().deleteAll([0])).type.toBe<Map<number, number>>();

  expect(Map<number, number>().deleteAll([0, 'a'])).type.toRaiseError();
});

test('#deleteIn', () => {
  expect(Map<number, number>().deleteIn([])).type.toBe<Map<number, number>>();

  const user = Map({ address: Map({ city: 'b' }) });

  expect(user.deleteIn(['address', 'city'])).type.toBe<typeof user>();
  expect(user.deleteIn(['address', 'citi'])).type.toRaiseError(
    'expected one of'
  );
});

test('#remove', () => {
  expect(Map<number, number>().remove(0)).type.toBe<Map<number, number>>();

  expect(Map<number, number>().remove('a')).type.toRaiseError();

  expect(Map({ a: 1, b: 'b' }).remove('b')).type.toBe<MapOf<{ a: number }>>();

  expect(
    Map<{ a: number; b?: string }>({ a: 1, b: 'b' }).remove('b')
  ).type.toBe<MapOf<{ a: number; b?: string | undefined }>>();

  expect(Map({ a: 1, b: 'b' }).remove('c')).type.toRaiseError();
});

test('#removeAll', () => {
  expect(Map<number, number>().removeAll([0])).type.toBe<Map<number, number>>();

  expect(Map<number, number>().removeAll([0, 'a'])).type.toRaiseError();
});

test('#removeIn', () => {
  expect(Map<number, number>().removeIn([])).type.toBe<Map<number, number>>();

  const user = Map({ address: Map({ city: 'b' }) });

  expect(user.removeIn(['address', 'city'])).type.toBe<typeof user>();
  expect(user.removeIn(['address', 'citi'])).type.toRaiseError(
    'expected one of'
  );
});

test('#hasIn', () => {
  expect(Map<number, number>().hasIn([1])).type.toBe<boolean>();

  const user = Map({ address: Map({ city: 'b' }), tags: List<string>() });

  expect(user.hasIn(['address', 'city'])).type.toBe<boolean>();
  expect(user.hasIn(['tags', 3])).type.toBe<boolean>();

  // a path the types know is wrong: the test would always be false
  expect(user.hasIn(['address', 'citi'])).type.toRaiseError('expected one of');

  // a key only known at runtime keeps the test useful
  const key = 'citi' as string;

  expect(user.hasIn(['address', key])).type.toBe<boolean>();
});

test('#clear', () => {
  expect(Map<number, number>().clear()).type.toBe<Map<number, number>>();

  expect(Map().clear(10)).type.toRaiseError();
});

test('#update', () => {
  expect(Map().update((v) => 1)).type.toBe<number>();

  expect(
    Map<number, number>().update((v: Map<string> | undefined) => v)
  ).type.toRaiseError();

  expect(
    Map<number, number>().update(0, (v: number | undefined) => 0)
  ).type.toBe<Map<number, number>>();

  expect(
    Map<number, number>().update(0, (v: number | undefined) => v + 'a')
  ).type.toRaiseError();

  expect(
    Map<number, number>().update(1, 10, (v: number | undefined) => 0)
  ).type.toBe<Map<number, number>>();

  expect(
    Map<number, number>().update(1, 'a', (v: number | undefined) => 0)
  ).type.toRaiseError();

  expect(
    Map<number, number>().update(1, 10, (v: number | undefined) => v + 'a')
  ).type.toRaiseError();

  expect(Map({ a: 1, b: 'b' }).update('c', (v) => v)).type.toRaiseError();

  expect(Map({ a: 1, b: 'b' }).update('b', (v) => v.toUpperCase())).type.toBe<
    MapOf<{ a: number; b: string }>
  >();

  expect(
    Map({ a: 1, b: 'b' }).update('b', 'NSV', (v) => v.toUpperCase())
  ).type.toBe<MapOf<{ a: number; b: string }>>();

  expect(Map({ a: 1, b: 'b' }).update((v) => ({ a: 'a' }))).type.toRaiseError();

  expect(
    Map({ a: 1, b: 'b' }).update((v) => v.set('a', 2).set('b', 'B'))
  ).type.toBe<MapOf<{ a: number; b: string }>>();

  expect(
    Map({ a: 1, b: 'b' }).update((v) => v.set('c', 'c'))
  ).type.toRaiseError();

  expect(
    Map<string, string>().update('noKey', (ls) => ls?.toUpperCase())
  ).type.toBe<Map<string, string>>();
});

test('#updateIn', () => {
  expect(Map<number, number>().updateIn([], (v) => v)).type.toBe<
    Map<number, number>
  >();

  expect(Map<number, number>().updateIn([], 10)).type.toRaiseError();

  // on a `MapOf`, the updater is typed from the path, like `getIn`
  const user = Map({
    address: Map({ zip: 0 }),
    scores: Map<string, number>(),
  });

  expect(
    user.updateIn(['address', 'zip'], (zip) => {
      expect(zip).type.toBe<number>();

      return zip + 1;
    })
  ).type.toBe<typeof user>();
  expect(
    user.updateIn(['address', 'zip'], (zip) => String(zip))
  ).type.toRaiseError();
  expect(user.updateIn(['address', 'zipp'], (zip) => zip)).type.toRaiseError(
    'expected one of'
  );

  // returning `undefined` removes the value
  expect(
    user.updateIn(['scores', 'math'], (score) => {
      expect(score).type.toBe<number | undefined>();

      return undefined;
    })
  ).type.toBe<typeof user>();
  expect(
    user.updateIn(['scores', 'math'], 0, (score) => {
      expect(score).type.toBe<number>();

      return score + 1;
    })
  ).type.toBe<typeof user>();

  // a path only known at runtime
  const path: Array<string> = ['address', 'zip'];

  expect(
    user.updateIn(path, (value) => {
      expect(value).type.toBe<unknown>();

      return 'x';
    })
  ).type.toBe<typeof user>();
});

test('#map', () => {
  expect(
    Map<number, number>().map(
      (value: number, key: number, iter: Map<number, number>) => 1
    )
  ).type.toBe<Map<number, number>>();

  expect(
    Map<number, number>().map(
      (value: number, key: number, iter: Map<number, number>) => 'a'
    )
  ).type.toBe<Map<number, string>>();

  expect(
    Map<number, number>().map<number>(
      (value: number, key: number, iter: Map<number, number>) => 1
    )
  ).type.toBe<Map<number, number>>();

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
  ).type.toBe<Map<number, number>>();

  expect(
    Map<number, number>().mapKeys(
      (value: number, key: number, iter: Map<number, number>) => 'a'
    )
  ).type.toBe<Map<string, number>>();

  expect(
    Map<number, number>().mapKeys<number>(
      (value: number, key: number, iter: Map<number, number>) => 1
    )
  ).type.toBe<Map<number, number>>();

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
  ).type.toBe<Map<number, number>>();

  expect(
    Map<number, number>().flatMap(
      (value: number, key: number, iter: Map<number, number>) => [['a', 'b']]
    )
  ).type.toBe<Map<string, string>>();

  expect(
    Map<number, number>().flatMap<number, number>(
      (value: number, key: number, iter: Map<number, number>) => [[0, 1]]
    )
  ).type.toBe<Map<number, number>>();

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
  expect(Map<string, number>().merge({ a: 1 })).type.toBe<
    Map<string, number>
  >();

  expect(Map<string, number>().merge({ a: { b: 1 } })).type.toBe<
    Map<string, number | { b: number }>
  >();

  expect(Map<number, number>().merge(Map<number, number>())).type.toBe<
    Map<number, number>
  >();

  expect(Map<number, number>().merge(Map<number, string>())).type.toBe<
    Map<number, string | number>
  >();

  expect(Map<number, number | string>().merge(Map<number, string>())).type.toBe<
    Map<number, string | number>
  >();

  expect(Map<number, number | string>().merge(Map<number, number>())).type.toBe<
    Map<number, string | number>
  >();

  expect(Map({ a: 1 }).merge(Map({ b: 2 }))).type.toBe<
    Map<'b' | 'a', number>
  >();
});

test('#mergeIn', () => {
  expect(Map<number, number>().mergeIn([], [])).type.toBe<
    Map<number, number>
  >();

  const user = Map({ address: Map({ city: 'b' }) });

  expect(user.mergeIn(['address'], { city: 'c' })).type.toBe<typeof user>();
  expect(user.mergeIn(['adress'], { city: 'c' })).type.toRaiseError(
    'expected one of'
  );
});

test('#mergeWith', () => {
  expect(
    Map<number, number>().mergeWith(
      (prev: number, next: number, key: number) => 1,
      Map<number, number>()
    )
  ).type.toBe<Map<number, number>>();

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
  ).type.toBe<Map<number, string | number>>();

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
  ).type.toBe<Map<string, number>>();

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
  ).type.toBe<Map<string, string | number>>();

  expect(
    Map<number, number | string>().mergeWith(
      (prev: number | string, next: number | string, key: number) => 1,
      Map<number, string>()
    )
  ).type.toBe<Map<number, string | number>>();
});

test('#mergeDeep', () => {
  expect(Map<string, number>().mergeDeep({ a: 1 })).type.toBe<
    Map<string, number>
  >();

  expect(Map<string, number>().mergeDeep({ a: { b: 1 } })).type.toBe<
    Map<string, number | { b: number }>
  >();

  expect(Map<string, number>().mergeDeep(Map({ a: { b: 1 } }))).type.toBe<
    Map<string, number | { b: number }>
  >();

  expect(Map<number, number>().mergeDeep(Map<number, number>())).type.toBe<
    Map<number, number>
  >();

  expect(Map<number, number>().mergeDeep(Map<number, string>())).type.toBe<
    Map<number, string | number>
  >();

  expect(
    Map<number, number | string>().mergeDeep(Map<number, string>())
  ).type.toBe<Map<number, string | number>>();

  expect(
    Map<number, number | string>().mergeDeep(Map<number, number>())
  ).type.toBe<Map<number, string | number>>();
});

test('#mergeDeepIn', () => {
  expect(Map<number, number>().mergeDeepIn([], [])).type.toBe<
    Map<number, number>
  >();

  const user = Map({ address: Map({ city: 'b' }) });

  expect(user.mergeDeepIn(['address'], { city: 'c' })).type.toBe<typeof user>();
  expect(user.mergeDeepIn(['adress'], { city: 'c' })).type.toRaiseError(
    'expected one of'
  );
});

test('#mergeDeepWith', () => {
  expect(
    Map<number, number>().mergeDeepWith(
      (prev: unknown, next: unknown, key: unknown) => 1,
      Map<number, number>()
    )
  ).type.toBe<Map<number, number>>();

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
  ).type.toBe<Map<string, number>>();

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
  ).type.toBe<Map<number, string | number>>();
});

test('#flip', () => {
  expect(Map<number, string>().flip()).type.toBe<Map<string, number>>();
});

test('#sort', () => {
  expect(Map<string, string>().sort()).type.toBe<
    Map<string, string> & OrderedMap<string, string>
  >();
  expect(Map<string, string>().sort((a, b) => 1)).type.toBe<
    Map<string, string> & OrderedMap<string, string>
  >();

  expect(Map({ a: 'a' }).sort()).type.toBe<
    MapOf<{ a: string }> & OrderedMap<'a', string>
  >();
});

test('#sortBy', () => {
  expect(Map<string, string>().sortBy((v) => v)).type.toBe<
    Map<string, string> & OrderedMap<string, string>
  >();

  expect(
    Map<string, string>().sortBy(
      (v) => v,
      (a, b) => 1
    )
  ).type.toBe<Map<string, string> & OrderedMap<string, string>>();
  expect(Map({ a: 'a' }).sortBy((v) => v)).type.toBe<
    MapOf<{ a: string }> & OrderedMap<'a', string>
  >();
});

test('#withMutations', () => {
  expect(Map<number, number>().withMutations((mutable) => mutable)).type.toBe<
    Map<number, number>
  >();

  expect(
    Map<number, number>().withMutations((mutable: Map<string>) => mutable)
  ).type.toRaiseError();
});

test('#asMutable', () => {
  expect(Map<number, number>().asMutable()).type.toBe<Map<number, number>>();
});

test('#asImmutable', () => {
  expect(Map<number, number>().asImmutable()).type.toBe<Map<number, number>>();
});

test('#toJS', () => {
  expect(Map<number, number>().toJS()).type.toBe<{
    [x: string]: number;
    [x: number]: number;
    [x: symbol]: number;
  }>();

  expect(Map({ a: 'A' }).toJS()).type.toBe<{ a: string }>();

  expect(Map({ a: Map({ b: 'b' }) }).toJS()).type.toBe<{
    a: { b: string };
  }>();
});

test('#toJSON', () => {
  expect(Map({ a: Map({ b: 'b' }) }).toJSON()).type.toBe<{
    a: MapOf<{ b: string }>;
  }>();
});

test('Map.isMap narrows a MapOf', () => {
  // the `getIn` overloads must keep `MapOf` a subtype of `Map`, which a type guard narrows to
  const value = Map({ firstname: 'a' }) as
    | MapOf<{ firstname: string }>
    | { firstname: string };

  if (Map.isMap(value)) {
    expect(value).type.toBe<MapOf<{ firstname: string }>>();

    expect(value.get('firstname')).type.toBe<string>();
  }
});
