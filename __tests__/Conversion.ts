///<reference path='../resources/jest.d.ts'/>

import * as jasmineCheck from 'jasmine-check';
jasmineCheck.install();

import { Map, OrderedMap, List, Record, is, fromJS } from '../';

declare function expect(val: any): ExpectWithIs;

interface ExpectWithIs extends Expect {
  is(expected: any): void;
  not: ExpectWithIs;
}

jasmine.addMatchers({
  is: function() {
    return {
      compare: function(actual, expected) {
        var passed = is(actual, expected);
        return {
          pass: passed,
          message: 'Expected ' + actual + (passed ? '' : ' not') + ' to equal ' + expected
        };
      }
    };
  }
});

// Symbols
declare function Symbol(name: string): Object;

describe('Conversion', () => {
  // Note: order of keys based on Map's hashing order
  var js = {
    deepList: [
      {
        position: "first"
      },
      {
        position: "second"
      },
      {
        position: "third"
      },
    ],
    deepMap: {
      a: "A",
      b: "B"
    },
    emptyMap: Object.create(null),
    point: {x: 10, y: 20},
    string: "Hello",
    list: [1, 2, 3]
  };

  var Point = Record({x:0, y:0}, 'Point');

  var immutableData = Map({
    deepList: List.of(
      Map({
        position: "first"
      }),
      Map({
        position: "second"
      }),
      Map({
        position: "third"
      })
    ),
    deepMap: Map({
      a: "A",
      b: "B"
    }),
    emptyMap: Map(),
    point: Map({x: 10, y: 20}),
    string: "Hello",
    list: List.of(1, 2, 3)
  });

  var immutableOrderedData = OrderedMap({
    deepList: List.of(
      OrderedMap({
        position: "first"
      }),
      OrderedMap({
        position: "second"
      }),
      OrderedMap({
        position: "third"
      })
    ),
    deepMap: OrderedMap({
      a: "A",
      b: "B"
    }),
    emptyMap: OrderedMap(),
    point: new Point({x: 10, y: 20}),
    string: "Hello",
    list: List.of(1, 2, 3)
  });

  var immutableOrderedDataString = 'OrderedMap { ' +
    '"deepList": List [ '+
      'OrderedMap { '+
        '"position": "first"'+
      ' }, ' +
      'OrderedMap { '+
        '"position": "second"'+
      ' }, '+
      'OrderedMap { '+
        '"position": "third"'+
      ' }' +
    ' ], '+
    '"deepMap": OrderedMap { '+
      '"a": "A", '+
      '"b": "B"'+
    ' }, '+
    '"emptyMap": OrderedMap {}, ' +
    '"point": Point { x: 10, y: 20 }, '+
    '"string": "Hello", '+
    '"list": List [ 1, 2, 3 ]'+
  ' }';

  var nonStringKeyMap = OrderedMap().set(1, true).set(false, "foo");
  var nonStringKeyMapString = 'OrderedMap { 1: true, false: "foo" }';

  it('Converts deep JS to deep immutable sequences', () => {
    expect(fromJS(js)).is(immutableData);
  });

  it('Throws when provided circular reference', () => {
    var o = {a: {b: {c: null}}};
    o.a.b.c = o;
    expect(() => fromJS(o)).toThrow(
      'Cannot convert circular structure to Immutable'
    )
  });

  it('Converts deep JSON with custom conversion', () => {
    var seq = fromJS(js, function (key, sequence) {
      if (key === 'point') {
        return new Point(sequence);
      }
      return Array.isArray(this[key]) ? sequence.toList() : sequence.toOrderedMap();
    });
    expect(seq).is(immutableOrderedData);
    expect(seq.toString()).is(immutableOrderedDataString);
  });

  it('Converts deep JSON with custom conversion including keypath if requested', () => {
    var paths = [];
    var seq = fromJS(js, function (key, sequence, keypath) {
      expect(arguments.length).toBe(3);
      paths.push(keypath);
      return Array.isArray(this[key]) ? sequence.toList() : sequence.toOrderedMap();
    });
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
    var seq = fromJS(js, function (key, sequence) {
      expect(arguments[2]).toBe(undefined);
    });

  });

  it('Prints keys as JS values', () => {
    expect(nonStringKeyMap.toString()).is(nonStringKeyMapString);
  });

  it('Converts deep sequences to JS', () => {
    var js2 = immutableData.toJS();
    expect(js2).not.is(js); // raw JS is not immutable.
    expect(js2).toEqual(js); // but should be deep equal.
  });

  it('Converts shallowly to JS', () => {
    var js2 = immutableData.toJSON();
    expect(js2).not.toEqual(js);
    expect(js2.deepList).toBe(immutableData.get('deepList'));
  });

  it('JSON.stringify() works equivalently on immutable sequences', () => {
    expect(JSON.stringify(js)).toBe(JSON.stringify(immutableData));
  });

  it('JSON.stringify() respects toJSON methods on values', () => {
    var Model = Record({});
    Model.prototype.toJSON = function() { return 'model'; }
    expect(
      Map({ a: new Model() }).toJS()
    ).toEqual({ a: {} });
    expect(
      JSON.stringify(Map({ a: new Model() }))
    ).toEqual('{"a":"model"}');
  });

  it('is conservative with array-likes, only accepting true Arrays.', () => {
    expect(fromJS({1: 2, length: 3})).is(
      Map().set('1', 2).set('length', 3)
    );
    expect(fromJS('string')).toEqual('string');
  });

  check.it('toJS isomorphic value', {maxSize: 30}, [gen.JSONValue], (js) => {
    var imm = fromJS(js);
    expect(imm && imm.toJS ? imm.toJS() : imm).toEqual(js);
  });

  it('Explicitly convert values to string using String constructor', () => {
    expect(() => {
      fromJS({ foo: Symbol('bar') }) + '';
      Map().set('foo', Symbol('bar')) + '';
      Map().set(Symbol('bar'), 'foo') + '';
    }).not.toThrow();
  });

  it('Converts an immutable value of an entry correctly', () => {
    var js = [{"key": "a"}];
    var result = fromJS(js).entrySeq().toJS();
    expect(result).toEqual([[0, {"key": "a"}]]);
  });

});
