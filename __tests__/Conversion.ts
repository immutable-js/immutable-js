import { describe, expect, it } from '@jest/globals';
import {
  type Collection,
  fromJS,
  is,
  List,
  Map,
  OrderedMap,
  Record,
} from 'immutable';
import fc, { type JsonValue } from 'fast-check';

describe('Conversion', () => {
  // Note: order of keys based on Map's hashing order
  const js = {
    deepList: [
      {
        position: 'first',
      },
      {
        position: 'second',
      },
      {
        position: 'third',
      },
    ],
    deepMap: {
      a: 'A',
      b: 'B',
    },
    emptyMap: Object.create(null),
    point: { x: 10, y: 20 },
    string: 'Hello',
    list: [1, 2, 3],
  };

  const Point = Record({ x: 0, y: 0 }, 'Point');

  const immutableData = Map({
    deepList: List.of(
      Map({
        position: 'first',
      }),
      Map({
        position: 'second',
      }),
      Map({
        position: 'third',
      })
    ),
    deepMap: Map({
      a: 'A',
      b: 'B',
    }),
    emptyMap: Map(),
    point: Map({ x: 10, y: 20 }),
    string: 'Hello',
    list: List.of(1, 2, 3),
  });

  const immutableOrderedData = OrderedMap({
    deepList: List.of(
      OrderedMap({
        position: 'first',
      }),
      OrderedMap({
        position: 'second',
      }),
      OrderedMap({
        position: 'third',
      })
    ),
    deepMap: OrderedMap({
      a: 'A',
      b: 'B',
    }),
    emptyMap: OrderedMap(),
    point: new Point({ x: 10, y: 20 }),
    string: 'Hello',
    list: List.of(1, 2, 3),
  });

  const immutableOrderedDataString =
    'OrderedMap { ' +
    '"deepList": List [ ' +
    'OrderedMap { ' +
    '"position": "first"' +
    ' }, ' +
    'OrderedMap { ' +
    '"position": "second"' +
    ' }, ' +
    'OrderedMap { ' +
    '"position": "third"' +
    ' }' +
    ' ], ' +
    '"deepMap": OrderedMap { ' +
    '"a": "A", ' +
    '"b": "B"' +
    ' }, ' +
    '"emptyMap": OrderedMap {}, ' +
    '"point": Point { x: 10, y: 20 }, ' +
    '"string": "Hello", ' +
    '"list": List [ 1, 2, 3 ]' +
    ' }';

  const nonStringKeyMap = OrderedMap().set(1, true).set(false, 'foo');
  const nonStringKeyMapString = 'OrderedMap { 1: true, false: "foo" }';

  it('Converts deep JS to deep immutable sequences', () => {
    expect(fromJS(js)).toEqual(immutableData);
  });

  it('Throws when provided circular reference', () => {
    type OType = { a: { b: { c: OType | null } } };

    const o: OType = { a: { b: { c: null } } };
    o.a.b.c = o;
    expect(() => fromJS(o)).toThrow(
      'Cannot convert circular structure to Immutable'
    );
  });

  it('Converts deep JSON with custom conversion', () => {
    const seq = fromJS(
      js,
      function (
        this: typeof js,
        key: PropertyKey,
        sequence:
          | Collection.Keyed<string, unknown>
          | Collection.Indexed<unknown>
      ) {
        if (key === 'point') {
          // @ts-expect-error -- to convert to real typing
          return new Point(sequence);
        }

        // @ts-expect-error -- any type for too complex object
        return Array.isArray(this[key])
          ? sequence.toList()
          : sequence.toOrderedMap();
      }
    );
    expect(seq).toEqual(immutableOrderedData);
    expect(seq.toString()).toEqual(immutableOrderedDataString);
  });

  it('Converts deep JSON with custom conversion including keypath if requested', () => {
    const paths: Array<Array<string | number> | undefined> = [];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const seq1 = fromJS(
      js,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function (this: typeof js, key: any, sequence, keypath) {
        expect(arguments.length).toBe(3);
        paths.push(keypath);

        // @ts-expect-error -- any type for too complex object
        return Array.isArray(this[key])
          ? sequence.toList()
          : sequence.toOrderedMap();
      }
    );
    expect(paths).toEqual([
      [],
      ['deepList'],
      ['deepList', 0],
      ['deepList', 1],
      ['deepList', 2],
      ['deepMap'],
      ['emptyMap'],
      ['point'],
      ['list'],
    ]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const seq2 = fromJS(js, function (key, sequence) {
      // eslint-disable-next-line prefer-rest-params
      expect(arguments[2]).toBe(undefined);
    });
  });

  it('Prints keys as JS values', () => {
    expect(nonStringKeyMap.toString()).toEqual(nonStringKeyMapString);
  });

  it('Converts deep sequences to JS', () => {
    const js2 = immutableData.toJS();
    expect(is(js2, js)).toBe(false); // raw JS is not immutable.
    expect(js2).toEqual(js); // but should be deep equal.
  });

  it('Converts shallowly to JS', () => {
    const js2 = immutableData.toJSON();
    expect(js2).not.toEqual(js);
    expect(js2.deepList).toBe(immutableData.get('deepList'));
  });

  it('JSON.stringify() works equivalently on immutable sequences', () => {
    expect(JSON.stringify(js)).toBe(JSON.stringify(immutableData));
  });

  it('JSON.stringify() respects toJSON methods on values', () => {
    const Model = Record({});
    Model.prototype.toJSON = function () {
      return 'model';
    };
    expect(Map({ a: new Model() }).toJS()).toEqual({ a: {} });
    expect(JSON.stringify(Map({ a: new Model() }))).toEqual('{"a":"model"}');
  });

  it('is conservative with array-likes, only accepting true Arrays.', () => {
    expect(fromJS({ 1: 2, length: 3 })).toEqual(
      Map().set('1', 2).set('length', 3)
    );
    expect(fromJS('string')).toEqual('string');
  });

  it('toJS isomorphic value', () => {
    fc.assert(
      fc.property(fc.jsonValue(), (v: JsonValue) => {
        const imm = fromJS(v);
        expect(
          // @ts-expect-error Property 'toJS' does not exist on type '{}'.ts(2339)
          imm && imm.toJS ? imm.toJS() : imm
        ).toEqual(v);
      }),
      { numRuns: 30 }
    );
  });

  it('Explicitly convert values to string using String constructor', () => {
    expect(() => fromJS({ foo: Symbol('bar') }) + '').not.toThrow();
    expect(() => Map().set('foo', Symbol('bar')) + '').not.toThrow();
    expect(() => Map().set(Symbol('bar'), 'foo') + '').not.toThrow();
  });

  it('Converts an immutable value of an entry correctly', () => {
    const arr = [{ key: 'a' }];
    const result = fromJS(arr).entrySeq().toJS();
    expect(result).toEqual([[0, { key: 'a' }]]);
  });
});
