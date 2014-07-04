///<reference path='../resources/jest.d.ts'/>
jest.autoMockOff();
import Persistent = require('../dist/Persistent');

describe('Equality', () => {

  function expectIs(left, right) {
    var comparison = Persistent.is(left, right);
    var commutative = Persistent.is(right, left);
    return comparison && commutative && comparison === commutative;
  }

  function expectIsNot(left, right) {
    var comparison = Persistent.is(left, right);
    var commutative = Persistent.is(right, left);
    return !comparison && !commutative && comparison === commutative;
  }

  it('uses Object.is semantics', () => {
    expectIs(null, null);
    expectIs(undefined, undefined);
    expectIsNot(undefined, null);

    expectIs(true, true);
    expectIs(false, false);
    expectIsNot(true, false);

    expectIs(123, 123);
    expectIsNot(123, -123);
    expectIs(NaN, NaN);
    expectIs(0, 0);
    expectIs(-0, -0);
    expectIsNot(0, -0);
    expectIs(NaN, 0/0);

    var string = "hello";
    expectIs(string, string);
    expectIs(string, "hello");
    expectIsNot("hello", "HELLO");
    expectIsNot("hello", "goodbye");

    var array = [1,2,3];
    expectIs(array, array);
    expectIsNot(array, [1,2,3]);

    var object = {key:'value'};
    expectIs(object, object);
    expectIsNot(object, {key:'value'});

    var arraySeq = Persistent.Sequence([1,2,3]);
    expectIs(arraySeq, arraySeq);
    expectIsNot(arraySeq, [1,2,3]);
    expectIs(arraySeq, Persistent.Sequence([1,2,3]));
    expectIs(arraySeq, arraySeq.map(x => x));

    // TODO: far more tests!

  });

});
