///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

jest.autoMockOff();

import Immutable = require('immutable');

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
    var arraySeq = Immutable.LazySequence.of(1,2,3);
    var arraySeq2 = Immutable.LazySequence([1,2,3]);
    expectIs(arraySeq, arraySeq);
    expectIs(arraySeq, Immutable.LazySequence.of(1,2,3));
    expectIs(arraySeq2, arraySeq2);
    expectIs(arraySeq2, Immutable.LazySequence([1,2,3]));
    expectIsNot(arraySeq, [1,2,3]);
    expectIsNot(arraySeq2, [1,2,3]);
    expectIs(arraySeq, arraySeq2);
    expectIs(arraySeq, arraySeq.map(x => x));
    expectIs(arraySeq2, arraySeq2.map(x => x));
  });

  it('compares vectors', () => {
    var vector = Immutable.Vector.of(1,2,3);
    expectIs(vector, vector);
    expectIsNot(vector, [1,2,3]);

    expectIs(vector, Immutable.LazySequence.of(1,2,3));
    expectIs(vector, Immutable.Vector.of(1,2,3));

    var vectorLonger = vector.push(4);
    expectIsNot(vector, vectorLonger);
    var vectorShorter = vectorLonger.pop();
    expect(vector === vectorShorter).toBe(false);
    expectIs(vector, vectorShorter);
  });

  // TODO: more tests

});
