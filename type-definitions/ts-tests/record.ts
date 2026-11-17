import {
  List,
  Map,
  MapOf,
  Record,
  RecordOf,
  Set,
  getIn,
  isRecord,
} from 'immutable';
import { expect, pick, test } from 'tstyche';

test('Factory', () => {
  const PointXY = Record({ x: 0, y: 0 });

  expect(PointXY).type.toBe<Record.Factory<{ x: number; y: number }>>();

  expect(PointXY({ x: 'a' })).type.toRaiseError();

  const pointXY = PointXY();

  expect(pointXY).type.toBe<
    Record<{ x: number; y: number }> & Readonly<{ x: number; y: number }>
  >();

  expect(pick(pointXY, 'x')).type.toBe<{ readonly x: number }>();

  expect(pick(pointXY, 'y')).type.toBe<{ readonly y: number }>();

  expect(pointXY.toJS()).type.toBe<{ x: number; y: number }>();

  class PointClass extends PointXY {
    setX(x: number) {
      return this.set('x', x);
    }

    setY(y: number) {
      return this.set('y', y);
    }
  }

  const point = new PointClass();

  expect(point).type.toBe<PointClass>();

  expect(point.x).type.toBe<number>();

  expect(point.y).type.toBe<number>();

  expect(point.setX(10)).type.toBe<PointClass>();

  expect(point.setY(10)).type.toBe<PointClass>();

  expect(point.toJSON()).type.toBe<{ x: number; y: number }>();

  expect(point.toJS()).type.toBe<{ x: number; y: number }>();
});

test('.getDescriptiveName', () => {
  const PointXY = Record({ x: 0, y: 0 });

  expect(Record.getDescriptiveName(PointXY())).type.toBe<string>();

  expect(Record.getDescriptiveName({})).type.toRaiseError();
});

test('Factory', () => {
  const WithMap = Record({
    map: Map({ a: 'A' }),
    list: List(['a']),
    set: Set(['a']),
  });

  const withMap = WithMap();

  expect(withMap.toJSON()).type.toBe<{
    map: MapOf<{ a: string }>;
    list: List<string>;
    set: Set<string>;
  }>();

  // should be `{ map: { a: string; }; list: string[]; set: string[]; }` but there is an issue with circular references
  expect(withMap.toJS()).type.toBe<{
    map: unknown;
    list: unknown;
    set: unknown;
  }>();
});

test('optional properties', () => {
  interface Size {
    distance: string;
  }

  const Line = Record<{ size?: Size; color?: string }>({
    size: undefined,
    color: 'red',
  });

  const line = Line({});

  // should be  { size?: { distance: string; } | undefined; color?: string | undefined; } but there is an issue with circular references
  expect(line.toJS()).type.toBe<{
    size?: unknown;
    color?: string | undefined;
  }>();
});

test('similar properties, but one is optional', () => {
  // see https://github.com/immutable-js/immutable-js/issues/1930

  interface Id {
    value: string;
  }

  expect<RecordOf<{ id: Id }>>().type.toBeAssignableTo<RecordOf<{ id?: Id }>>();
});

test('#getIn', () => {
  const Address = Record({ city: '', zip: 0 });
  const Person = Record({
    name: '',
    address: Address(),
    tags: List(['a']),
    scores: Map<string, number>(),
    settings: Map({ theme: 'dark' }),
    raw: { nested: { deep: true } },
  });
  const person = Person();

  expect(person.getIn(['name'])).type.toBe<string>();

  expect(person.getIn(['name' as const])).type.toBe<string>();

  expect(person.getIn(['name'], 'not set')).type.toBe<string>();

  // through a nested Record
  expect(person.getIn(['address', 'city'])).type.toBe<string>();

  // a Record method is not one of its properties
  expect(person.getIn(['address', 'get'])).type.toRaiseError('expected one of');

  expect(person.getIn(['address', 'street'])).type.toRaiseError(
    'expected one of'
  );

  // unless a `notSetValue` is given: it is then the result
  expect(person.getIn(['address', 'street'], 'nsv')).type.toBe<'nsv'>();

  // through a nested List, a Map built from an object, a Map with unknown keys and a plain object
  expect(person.getIn(['tags', 0])).type.toBe<string | undefined>();

  expect(person.getIn(['settings', 'theme'])).type.toBe<string>();

  // like with `get`, the key of a Map with unknown keys may be missing
  expect(person.getIn(['scores', 'math'])).type.toBe<number | undefined>();

  expect(person.getIn(['scores', 'math'], null)).type.toBe<number | null>();

  expect(person.getIn(['raw', 'nested', 'deep'])).type.toBe<boolean>();

  // an invalid path is a type error, like `MapOf#getIn`
  expect(person.getIn(['unknown'])).type.toRaiseError('expected one of');

  // nothing can be read below a primitive
  expect(person.getIn(['name', 'length'])).type.toRaiseError(
    'no key can be read from'
  );

  expect(person.getIn(['unknown'], 'nsv')).type.toBe<'nsv'>();

  // a path only known at runtime
  const path: Array<string> = ['name'];

  expect(person.getIn(path)).type.toBe<unknown>();

  expect(person.getIn(List(['name']))).type.toBe<unknown>();

  const readonlyPath: ReadonlyArray<string> = ['name'];

  expect(person.getIn(readonlyPath)).type.toBe<unknown>();

  // an iterable which is neither an array nor an ordered collection is a type error
  const iterablePath: Iterable<string> = ['name'];

  expect(person.getIn(iterablePath)).type.toRaiseError();

  // a subclass can relay a generic path to `super.getIn`
  class PersonWithGenericPath extends Person {
    getIn<P extends ReadonlyArray<PropertyKey>>(keyPath: P): unknown {
      return super.getIn(keyPath);
    }
  }

  expect(new PersonWithGenericPath().getIn(['name'])).type.toBe<unknown>();

  // a generic Record: the path can not be checked
  function genericRecord<T extends { a: { b: number } }>(record: RecordOf<T>) {
    return record.getIn(['a', 'b']);
  }

  expect(genericRecord(Record({ a: { b: 1 } })())).type.toBe<number>();

  // an object as a key, like the key of a `Map<object, V>`: the types do not follow it
  const objectKey = { id: 1 };
  const ByObject = Record({ users: Map<{ id: number }, string>() });

  expect(ByObject().getIn(['users', objectKey])).type.toBe<unknown>();

  // a `Map<object, V>` that may be missing
  const MaybeByObject = Record({
    users: null as Map<{ id: number }, string> | null,
  });

  expect(MaybeByObject().getIn(['users', objectKey])).type.toBe<unknown>();

  // it is refused where no key can be an object
  expect(ByObject().getIn([objectKey])).type.toRaiseError('expected one of');

  // a key that may be `null` is a type error: the caller has to narrow it
  const maybeKey = 'city' as string | null;

  expect(person.getIn(['address', maybeKey])).type.toRaiseError();

  // a path given `as const`
  const constPath = ['address', 'city'] as const;

  expect(person.getIn(constPath)).type.toBe<string>();

  expect(person.getIn(constPath, 'nsv')).type.toBe<string>();

  class PersonClass extends Person {
    cityName() {
      return this.getIn(['address', 'city']);
    }
  }

  expect(new PersonClass().cityName()).type.toBe<string>();
});

test('#getIn through a value that may be missing', () => {
  interface Size {
    distance: string;
  }

  const Wallet = Record({ contract: '' });

  const Line = Record<{
    size?: Size;
    owner: RecordOf<{ name: string }> | null;
    // a relation is either an id or the related Record
    wallet: string | RecordOf<{ contract: string }>;
  }>({ size: undefined, owner: null, wallet: Wallet() });

  const line = Line();

  expect(line.getIn(['size', 'distance'])).type.toBe<string | undefined>();

  expect(line.getIn(['owner', 'name'])).type.toBe<string | undefined>();

  expect(line.getIn(['wallet', 'contract'])).type.toBe<string | undefined>();

  expect(line.getIn(['wallet'])).type.toBe<
    string | RecordOf<{ contract: string }>
  >();

  // with a `notSetValue`, it replaces the `undefined` of a missing value on the way
  expect(line.getIn(['owner', 'name'], 'nsv')).type.toBe<string | 'nsv'>();

  expect(line.getIn(['wallet', 'contract'], 'nsv')).type.toBe<string | 'nsv'>();

  // the `undefined` of the value itself stays, as the runtime gives it back
  expect(line.getIn(['size'], 'nsv')).type.toBe<Size | undefined | 'nsv'>();
});

test('deep changes are typed like `getIn`', () => {
  const Address = Record({ city: '', zip: 0 });
  const Person = Record({
    address: Address(),
    tags: List(['a']),
    scores: Map<string, number>(),
  });
  const person = Person();
  type Person = typeof person;

  expect(person.hasIn(['address', 'city'])).type.toBe<boolean>();
  // a path the types know is wrong: the test would always be false
  expect(person.hasIn(['address', 'citi'])).type.toRaiseError(
    'expected one of'
  );
  // a key only known at runtime keeps the test useful
  const key = 'citi' as string;

  expect(person.hasIn(['address', key])).type.toBe<boolean>();

  expect(person.setIn(['address', 'city'], 'Lyon')).type.toBe<Person>();
  expect(person.setIn(['tags', 0], 'b')).type.toBe<Person>();
  expect(person.setIn(['address', 'citi'], 'Lyon')).type.toRaiseError(
    'expected one of'
  );
  expect(person.setIn(['address', 'city'], 1)).type.toRaiseError();
  expect(person.setIn(['tags', 0], 1)).type.toRaiseError();

  expect(
    person.updateIn(['address', 'zip'], (zip) => {
      expect(zip).type.toBe<number>();

      return zip + 1;
    })
  ).type.toBe<Person>();
  expect(
    person.updateIn(['address', 'zip'], (zip) => String(zip))
  ).type.toRaiseError();
  expect(
    person.updateIn(['scores', 'math'], 0, (score) => {
      expect(score).type.toBe<number>();

      return score + 1;
    })
  ).type.toBe<Person>();

  expect(person.deleteIn(['tags', 0])).type.toBe<Person>();
  expect(person.removeIn(['scores', 'math'])).type.toBe<Person>();
  expect(person.removeIn(['address', 'citi'])).type.toRaiseError(
    'expected one of'
  );

  expect(person.mergeIn(['address'], { city: 'Lyon' })).type.toBe<Person>();
  expect(person.mergeDeepIn(['address'], { city: 'Lyon' })).type.toBe<Person>();
  expect(person.mergeIn(['adress'], { city: 'Lyon' })).type.toRaiseError(
    'expected one of'
  );

  // a path only known at runtime takes any value
  const path: Array<string> = ['address', 'city'];

  expect(person.setIn(path, 1)).type.toBe<Person>();
  expect(person.setIn(List(['address', 'city']), 1)).type.toBe<Person>();
});

test('getIn through a nested Record', () => {
  interface User {
    name: string;
    job: { title: string };
    tags: List<string>;
    boss: RecordOf<{ name: string }> | null;
  }

  const User = Record<User>({
    name: '',
    job: { title: '' },
    tags: List(),
    boss: null,
  });
  const user = User();
  const id = 'id' as string;

  // the properties of the nested Record keep their type, whatever holds it
  const map = Map({
    one: user,
    users: Map<string, RecordOf<User>>(),
    list: List([user]),
  });

  expect(map.getIn(['one', 'job', 'title'])).type.toBe<string>();

  expect(map.getIn(['one', 'tags', 0])).type.toBe<string | undefined>();

  expect(map.getIn(['one', 'boss', 'name'])).type.toBe<string | undefined>();

  expect(map.getIn(['users', id, 'job', 'title'])).type.toBe<
    string | undefined
  >();

  expect(map.getIn(['list', 0, 'job', 'title'])).type.toBe<
    string | undefined
  >();

  expect(map.getIn(['one', 'job', 'titl'])).type.toRaiseError(
    'expected one of'
  );

  expect(map.getIn(['one', 'boss', 'nam'])).type.toRaiseError(
    'expected one of'
  );

  expect(map.getIn(['list', 0, 'job', 'titl'])).type.toRaiseError(
    'expected one of'
  );

  // in a Record
  const Team = Record({ lead: user });

  expect(Team().getIn(['lead', 'job', 'title'])).type.toBe<string>();

  expect(Team().getIn(['lead', 'job', 'titl'])).type.toRaiseError(
    'expected one of'
  );

  // with the functional `getIn`
  expect(getIn({ user }, ['user', 'job', 'title'])).type.toBe<string>();

  expect(getIn({ user }, ['user', 'job', 'titl'])).type.toRaiseError(
    'expected one of'
  );

  // a subclass of the Record
  class UserClass extends User {}

  expect(
    Map({ user: new UserClass() }).getIn(['user', 'job', 'title'])
  ).type.toBe<string>();
});

test('#update', () => {
  const PointXY = Record({ x: 0, y: 0 });
  const point = PointXY();

  expect(point.update('x', (x) => x + 1)).type.toBe<typeof point>();

  expect(point.update('x', (x) => String(x))).type.toRaiseError();

  expect(point.update('z', (z) => z)).type.toRaiseError();

  expect(point.update((p) => p.set('x', 1))).type.toBe<typeof point>();

  expect(point.update((p) => p.x + p.y)).type.toBe<number>();
});

test('Record.isRecord narrows a RecordOf', () => {
  // the guard type is `Record<any>`, the only Record every Record is assignable to
  const Point = Record({ x: 0 });
  const value = Point() as RecordOf<{ x: number }> | { x: number };

  if (Record.isRecord(value)) {
    expect(value).type.toBe<RecordOf<{ x: number }>>();

    expect(value.get('x')).type.toBe<number>();
  }

  if (isRecord(value)) {
    expect(value).type.toBe<RecordOf<{ x: number }>>();
  }

  class PointClass extends Point {}
  const instance = new PointClass() as PointClass | { x: number };

  if (Record.isRecord(instance)) {
    expect(instance).type.toBe<PointClass>();
  }

  // a Record with an optional property
  const Line = Record<{ size?: number }>({ size: undefined });
  const line = Line() as RecordOf<{ size?: number }> | null;

  if (Record.isRecord(line)) {
    expect(line).type.toBe<RecordOf<{ size?: number }>>();
  }

  // the values of an `unknown` value stay `unknown`
  const unknownValue = Point() as unknown;

  if (Record.isRecord(unknownValue)) {
    expect(unknownValue.get('x')).type.toBe<unknown>();

    expect(unknownValue.toJS()).type.toBe<{ [x: string]: unknown }>();
  }

  if (isRecord(unknownValue)) {
    expect(unknownValue.get('x')).type.toBe<unknown>();
  }

  // a Map is not a Record
  const mapOrRecord = Map({ x: 0 }) as
    | MapOf<{ x: number }>
    | RecordOf<{ x: number }>;

  if (Record.isRecord(mapOrRecord)) {
    expect(mapOrRecord).type.toBe<RecordOf<{ x: number }>>();
  }
});
