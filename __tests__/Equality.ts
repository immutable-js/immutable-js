/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

import * as jasmineCheck from 'jasmine-check';
jasmineCheck.install();

import { is, List, Map, Seq, Set } from 'immutable';

describe('Equality', () => {
  function expectIs(left, right) {
    const comparison = is(left, right);
    expect(comparison).toBe(true);
    const commutative = is(right, left);
    expect(commutative).toBe(true);
  }

  function expectIsNot(left, right) {
    const comparison = is(left, right);
    expect(comparison).toBe(false);
    const commutative = is(right, left);
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
    // Note: Unlike Object.is, is assumes 0 and -0 are the same value,
    // matching the behavior of ES6 Map key equality.
    expectIs(0, -0);
    expectIs(NaN, 0 / 0);

    const str = 'hello';
    expectIs(str, str);
    expectIs(str, 'hello');
    expectIsNot('hello', 'HELLO');
    expectIsNot('hello', 'goodbye');

    const array = [1, 2, 3];
    expectIs(array, array);
    expectIsNot(array, [1, 2, 3]);

    const object = { key: 'value' };
    expectIs(object, object);
    expectIsNot(object, { key: 'value' });
  });

  it('dereferences things', () => {
    const ptrA = { foo: 1 },
      ptrB = { foo: 2 };
    expectIsNot(ptrA, ptrB);
    ptrA.valueOf = ptrB.valueOf = function () {
      return 5;
    };
    expectIs(ptrA, ptrB);
    const object = { key: 'value' };
    ptrA.valueOf = ptrB.valueOf = function () {
      return object;
    };
    expectIs(ptrA, ptrB);
    ptrA.valueOf = ptrB.valueOf = function () {
      return null as any;
    };
    expectIs(ptrA, ptrB);
    ptrA.valueOf = ptrB.valueOf = function () {
      return void 0 as any;
    };
    expectIs(ptrA, ptrB);
    ptrA.valueOf = function () {
      return 4;
    };
    ptrB.valueOf = function () {
      return 5;
    };
    expectIsNot(ptrA, ptrB);
  });

  it('compares sequences', () => {
    const arraySeq = Seq([1, 2, 3]);
    const arraySeq2 = Seq([1, 2, 3]);
    expectIs(arraySeq, arraySeq);
    expectIs(arraySeq, Seq([1, 2, 3]));
    expectIs(arraySeq2, arraySeq2);
    expectIs(arraySeq2, Seq([1, 2, 3]));
    expectIsNot(arraySeq, [1, 2, 3]);
    expectIsNot(arraySeq2, [1, 2, 3]);
    expectIs(arraySeq, arraySeq2);
    expectIs(
      arraySeq,
      arraySeq.map((x) => x)
    );
    expectIs(
      arraySeq2,
      arraySeq2.map((x) => x)
    );
  });

  it('compares lists', () => {
    const list = List([1, 2, 3]);
    expectIs(list, list);
    expectIsNot(list, [1, 2, 3]);

    expectIs(list, Seq([1, 2, 3]));
    expectIs(list, List([1, 2, 3]));

    const listLonger = list.push(4);
    expectIsNot(list, listLonger);
    const listShorter = listLonger.pop();
    expect(list === listShorter).toBe(false);
    expectIs(list, listShorter);
  });

  const genSimpleVal = gen.returnOneOf(['A', 1]);

  const genVal = gen.oneOf([
    gen.map(List, gen.array(genSimpleVal, 0, 4)),
    gen.map(Set, gen.array(genSimpleVal, 0, 4)),
    gen.map(Map, gen.array(gen.array(genSimpleVal, 2), 0, 4)),
  ]);

  check.it(
    'has symmetric equality',
    { times: 1000 },
    [genVal, genVal],
    (a, b) => {
      expect(is(a, b)).toBe(is(b, a));
    }
  );

  check.it('has hash equality', { times: 1000 }, [genVal, genVal], (a, b) => {
    if (is(a, b)) {
      expect(a.hashCode()).toBe(b.hashCode());
    }
  });

  describe('hash', () => {
    it('differentiates decimals', () => {
      expect(Seq([1.5]).hashCode()).not.toBe(Seq([1.6]).hashCode());
    });
  });
});
