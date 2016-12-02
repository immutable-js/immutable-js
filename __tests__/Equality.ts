///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

jest.autoMockOff();

import * as jasmineCheck from 'jasmine-check';
jasmineCheck.install();

import { List, Map, Set, Seq, is, compareWith } from 'immutable';

describe('Equality', () => {

  function expectIs(left, right) {
    var comparison = is(left, right);
    expect(comparison).toBe(true);
    var commutative = is(right, left);
    expect(commutative).toBe(true);
  }

  function expectIsNot(left, right) {
    var comparison = is(left, right);
    expect(comparison).toBe(false);
    var commutative = is(right, left);
    expect(commutative).toBe(false);
  }

  function withComparators(callback) {
      ['equals', null, 'similar'].forEach(comparatorName => {
         compareWith(comparatorName);
         callback();
     });
  }

  afterEach(() => {
      compareWith('equals');
  })

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

  it('uses Object.is semantics', withComparators(() => {
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
    // Note: Unlike Object.is, is assumes 0 and -0 are the same value,
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
  }));

  it('compares sequences', withComparators(() => {
    var arraySeq = Seq.of(1,2,3);
    var arraySeq2 = Seq([1,2,3]);
    expectIs(arraySeq, arraySeq);
    expectIs(arraySeq, Seq.of(1,2,3));
    expectIs(arraySeq2, arraySeq2);
    expectIs(arraySeq2, Seq([1,2,3]));
    expectIsNot(arraySeq, [1,2,3]);
    expectIsNot(arraySeq2, [1,2,3]);
    expectIs(arraySeq, arraySeq2);
    expectIs(arraySeq, arraySeq.map(x => x));
    expectIs(arraySeq2, arraySeq2.map(x => x));
  }));

  it('compares lists', withComparators(() => {
    var list = List.of(1,2,3);
    expectIs(list, list);
    expectIsNot(list, [1,2,3]);

    expectIs(list, Seq.of(1,2,3));
    expectIs(list, List.of(1,2,3));

    var listLonger = list.push(4);
    expectIsNot(list, listLonger);
    var listShorter = listLonger.pop();
    expect(list === listShorter).toBe(false);
    expectIs(list, listShorter);
  }));

  it('compares objects by the comparator function', () => {
    var equals = function(type, obj) {
      return obj.type === type;
    };
    var objectA1 = { equals: equals.bind(null, 'A'), type: 'A' };
    var objectA2 = { equals: equals.bind(null, 'A'), type: 'A' };
    var objectB1 = { equals: equals.bind(null, 'B'), type: 'B' };
    var objectC1 = { similar: equals.bind(null, 'C'), type: 'C' };
    var objectC2 = { similar: equals.bind(null, 'C'), type: 'C' };
    expectIs(objectA1, objectA2);
    expectIsNot(objectA1, objectB1);
    expectIsNot(objectC1, objectC2);
    compareWith(null);
    expectIs(objectA1, objectA1);
    expectIsNot(objectA1, objectA2);
    expectIsNot(objectC1, objectC2);
    compareWith('similar');
    expectIsNot(objectA1, objectA2);
    expectIs(objectC1, objectC2);
    expectIs(objectA1, objectA1);
  });

  var genSimpleVal = gen.returnOneOf(['A', 1]);

  var genVal = gen.oneOf([
    gen.map(List, gen.array(genSimpleVal, 0, 4)),
    gen.map(Set, gen.array(genSimpleVal, 0, 4)),
    gen.map(Map, gen.array(gen.array(genSimpleVal, 2), 0, 4))
  ]);

  check.it('has symmetric equality', {times: 1000}, [genVal, genVal], (a, b) => {
    expect(is(a, b)).toBe(is(b, a));
  });

  check.it('has hash equality', {times: 1000}, [genVal, genVal], (a, b) => {
    if (is(a, b)) {
      expect(a.hashCode()).toBe(b.hashCode());
    }
  });

  describe('hash', () => {

    it('differentiates decimals', () => {
      expect(
        Seq.of(1.5).hashCode()
      ).not.toBe(
        Seq.of(1.6).hashCode()
      );
    });

  });

});
