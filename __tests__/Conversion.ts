///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

jest.autoMockOff();

import Immutable = require('immutable');
import Map = Immutable.Map;
import OrderedMap = Immutable.OrderedMap;
import Vector = Immutable.Vector;

declare function expect(val: any): ExpectWithIs;

interface ExpectWithIs extends Expect {
  is(expected: any): void;
  not: ExpectWithIs;
}

describe('Conversion', () => {

  beforeEach(function () {
    this.addMatchers({
      is: function(expected) {
        return Immutable.is(this.actual, expected);
      }
    });
  });

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
    point: {x: 10, y: 20},
    string: "Hello",
    list: [1, 2, 3]
  };

  var Point = Immutable.Record({x:0, y:0}, 'Point');

  var immutableData = Map({
    deepList: Vector.of(
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
    point: Map({x: 10, y: 20}),
    string: "Hello",
    list: Vector.of(1, 2, 3)
  });

  var immutableOrderedData = OrderedMap({
    deepList: Vector.of(
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
    point: new Point({x: 10, y: 20}),
    string: "Hello",
    list: Vector.of(1, 2, 3)
  });

  var immutableOrderedDataString = 'OrderedMap { ' +
    'deepList: Vector [ '+
      'OrderedMap { '+
        'position: "first"'+
      ' }, ' +
      'OrderedMap { '+
        'position: "second"'+
      ' }, '+
      'OrderedMap { '+
        'position: "third"'+
      ' }' +
    ' ], '+
    'deepMap: OrderedMap { '+
      'a: "A", '+
      'b: "B"'+
    ' }, '+
    'point: Point { x: 10, y: 20 }, '+
    'string: "Hello", '+
    'list: Vector [ 1, 2, 3 ]'+
  ' }';

  it('Converts deep JS to deep immutable sequences', () => {
    expect(Immutable.fromJS(js)).is(immutableData);
  });

  it('Converts deep JSON with custom conversion', () => {
    var seq = Immutable.fromJS(js, function (key, sequence) {
      if (key === 'point') {
        return new Point(sequence);
      }
      return Array.isArray(this[key]) ? sequence.toVector() : sequence.toOrderedMap();
    });
    expect(seq).is(immutableOrderedData);
    expect(seq.toString()).is(immutableOrderedDataString);
  });

  it('Converts deep sequences to JSON', () => {
    var json = immutableData.toJS();
    expect(json).not.is(js); // raw JS is not immutable.
    expect(json).toEqual(js); // but should be deep equal.
  });

  it('JSON.stringify() works equivalently on immutable sequences', () => {
    expect(JSON.stringify(js)).toBe(JSON.stringify(immutableData));
  });

});
