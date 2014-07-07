///<reference path='../resources/jest.d.ts'/>
jest.autoMockOff();
import Persistent = require('../dist/Persistent');
import Map = Persistent.Map;
import Vector = Persistent.Vector;

declare function expect(val: any): ExpectWithIs;

interface ExpectWithIs extends Expect {
  is(expected: any): void;
}

// This doesn't work yet because of a jest bug with instanceof.
xdescribe('Conversion', () => {

  beforeEach(function () {
    this.addMatchers({
      is: function(expected) {
        console.log('is');
        console.log(''+this.actual);
        console.log('same value as');
        console.log(''+expected);
        console.log('is?: ' + Persistent.is(this.actual, expected));
        return Persistent.is(this.actual, expected);
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

  it('Converts deep JS to deep persistent structures', () => {
    expect(Persistent.fromJS(js)).is(
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



