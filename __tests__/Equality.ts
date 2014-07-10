///<reference path='../resources/jest.d.ts'/>
jest.autoMockOff();
import Immutable = require('../dist/Immutable');

describe('Equality', () => {

  function expectIs(left, right) {
    var comparison = Immutable.is(left, right);
    var commutative = Immutable.is(right, left);
    return comparison && commutative && comparison === commutative;
  }

  function expectIsNot(left, right) {
    var comparison = Immutable.is(left, right);
    var commutative = Immutable.is(right, left);
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
  });

  it('compares sequences', () => {
    var arraySeq = Immutable.Sequence(1,2,3);
    var mutableArraySeq = Immutable.Sequence([1,2,3]);
    expect(arraySeq.isMutable()).toBe(false);
    expect(mutableArraySeq.isMutable()).toBe(true);
    expectIs(arraySeq, arraySeq);
    expectIs(arraySeq, Immutable.Sequence(1,2,3));
    expectIs(mutableArraySeq, mutableArraySeq);
    expectIsNot(mutableArraySeq, Immutable.Sequence([1,2,3]));
    expectIsNot(arraySeq, [1,2,3]);
    expectIsNot(mutableArraySeq, [1,2,3]);
    expectIsNot(arraySeq, mutableArraySeq);
    expectIs(arraySeq, mutableArraySeq.asImmutable());
    expectIs(arraySeq, arraySeq.map(x => x));
    expectIs(mutableArraySeq, mutableArraySeq.map(x => x));
  });

  it('compares vectors', () => {
    var vector = Immutable.Vector(1,2,3);
    expectIs(vector, vector);
    expectIsNot(vector, [1,2,3]);

    expectIs(vector, Immutable.Sequence(1,2,3));
    expectIs(vector, Immutable.Vector(1,2,3));

    var vectorLonger = vector.push(4);
    expectIsNot(vector, vectorLonger);
    var vectorShorter = vectorLonger.pop();
    expectIs(vector, vectorShorter);

    var mutableVector = vector.asMutable();
    expectIsNot(vector, mutableVector);

    var mutableLonger = mutableVector.push(4);
    expectIs(mutableVector, mutableLonger);
    var mutableShorter = mutableLonger.pop();
    expectIs(mutableVector, mutableShorter);

    var immutableVector = mutableVector.asImmutable();
    expectIs(mutableVector, immutableVector);
    expectIs(vector, immutableVector);
  });

  // TODO: more tests

});
