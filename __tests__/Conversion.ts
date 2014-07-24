///<reference path='../resources/jest.d.ts'/>
jest.autoMockOff();
import Immutable = require('../dist/Immutable');
import Map = Immutable.Map;
import Vector = Immutable.Vector;

declare function expect(val: any): ExpectWithIs;

interface ExpectWithIs extends Expect {
  is(expected: any): void;
  not: ExpectWithIs;
}

// This doesn't work yet because of a jest bug with instanceof.
describe('Conversion', () => {

  beforeEach(function () {
    this.addMatchers({
      is: function(expected) {
        return Immutable.is(this.actual, expected);
      }
    });
  });

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
    string: "Hello",
    list: [1, 2, 3]
  };

  var immutableData = Map({
    deepList: Vector(
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
    string: "Hello",
    list: Vector(1, 2, 3)
  });

  it('Converts deep JS to deep immutable sequences', () => {
    expect(Immutable.fromJSON(js)).is(immutableData);
  });

  it('Converts deep sequences to JSON', () => {
    expect(immutableData.toJSON()).not.is(js); // raw JS is not immutable.
    expect(immutableData.toJSON()).toEqual(js); // but should be deep equal.
  });

  it('JSON.stringify() works equivalently on immutable sequences', () => {
    expect(JSON.stringify(js)).toBe(JSON.stringify(immutableData));
  });

});
