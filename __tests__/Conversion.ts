///<reference path='../resources/jest.d.ts'/>
jest.autoMockOff();
import Immutable = require('../dist/Immutable');
import Map = Immutable.Map;
import Vector = Immutable.Vector;

declare function expect(val: any): ExpectWithIs;

interface ExpectWithIs extends Expect {
  is(expected: any): void;
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
    string: "Hello",
    list: [1, 2, 3],
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
    }
  };

  it('Converts deep JS to deep immutable structures', () => {
    expect(Immutable.fromJS(js)).is(
      Map({
        string: "Hello",
        list: Vector(1, 2, 3),
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
        })
      })
    );
  });

});



