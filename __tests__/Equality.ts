///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

jest.autoMockOff();

import jasmineCheck = require('jasmine-check');
jasmineCheck.install();

import Immutable = require('immutable');

describe('Equality', () => {

  function expectIs(left, right) {
    var comparison = Immutable.is(left, right);
    expect(comparison).toBe(true);
    var commutative = Immutable.is(right, left);
    expect(commutative).toBe(true);
  }

  function expectIsNot(left, right) {
    var comparison = Immutable.is(left, right);
    expect(comparison).toBe(false);
    var commutative = Immutable.is(right, left);
    expect(commutative).toBe(false);
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
    // Note: Unlike Object.is, Immutable.is assumes 0 and -0 are the same value,
    // matching the behavior of ES6 Map key equality.
    expectIs(0, -0);
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

  it('dereferences things', () => {
    var ptrA = {foo: 1}, ptrB = {foo: 2};
    expectIsNot(ptrA, ptrB);
    ptrA.valueOf = ptrB.valueOf = function() {
      return 5;
    }
    expectIs(ptrA, ptrB);
    var object = {key:'value'};
    ptrA.valueOf = ptrB.valueOf = function() {
      return object;
    }
    expectIs(ptrA, ptrB);
    ptrA.valueOf = ptrB.valueOf = function() {
      return null;
    }
    expectIs(ptrA, ptrB);
    ptrA.valueOf = ptrB.valueOf = function() {
      return void 0;
    }
    expectIs(ptrA, ptrB);
    ptrA.valueOf = function() {
      return 4;
    }
    ptrB.valueOf = function() {
      return 5;
    }
    expectIsNot(ptrA, ptrB);
  });

  it('compares sequences', () => {
    var arraySeq = Immutable.Seq.of(1,2,3);
    var arraySeq2 = Immutable.Seq([1,2,3]);
    expectIs(arraySeq, arraySeq);
    expectIs(arraySeq, Immutable.Seq.of(1,2,3));
    expectIs(arraySeq2, arraySeq2);
    expectIs(arraySeq2, Immutable.Seq([1,2,3]));
    expectIsNot(arraySeq, [1,2,3]);
    expectIsNot(arraySeq2, [1,2,3]);
    expectIs(arraySeq, arraySeq2);
    expectIs(arraySeq, arraySeq.map(x => x));
    expectIs(arraySeq2, arraySeq2.map(x => x));
  });

  it('compares lists', () => {
    var list = Immutable.List.of(1,2,3);
    expectIs(list, list);
    expectIsNot(list, [1,2,3]);

    expectIs(list, Immutable.Seq.of(1,2,3));
    expectIs(list, Immutable.List.of(1,2,3));

    var listLonger = list.push(4);
    expectIsNot(list, listLonger);
    var listShorter = listLonger.pop();
    expect(list === listShorter).toBe(false);
    expectIs(list, listShorter);
  });

  var genSimpleVal = gen.returnOneOf(['A', 1]);

  var genVal = gen.oneOf([
    gen.map(Immutable.List, gen.array(genSimpleVal, 0, 4)),
    gen.map(Immutable.Set, gen.array(genSimpleVal, 0, 4)),
    gen.map(Immutable.Map, gen.array(gen.array(genSimpleVal, 2), 0, 4))
  ]);

  check.it('has symmetric equality', {times: 1000}, [genVal, genVal], (a, b) => {
    expect(Immutable.is(a, b)).toBe(Immutable.is(b, a));
  });

  check.it('has hash equality', {times: 1000}, [genVal, genVal], (a, b) => {
    if (Immutable.is(a, b)) {
      expect(a.hashCode()).toBe(b.hashCode());
    }
  });

  describe('hash', () => {

    it('differentiates decimals', () => {
      expect(
        Immutable.Seq.of(1.5).hashCode()
      ).not.toBe(
        Immutable.Seq.of(1.6).hashCode()
      );
    });

  });

});
