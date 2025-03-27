import { is, List, Map, Seq, Set } from 'immutable';
import { describe, expect, it } from 'vitest';
import fc from 'fast-check';

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
    const ptrA = { foo: 1 };
    const ptrB = { foo: 2 };
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return null as any;
    };
    expectIs(ptrA, ptrB);
    ptrA.valueOf = ptrB.valueOf = function () {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return undefined as any;
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

  const genSimpleVal = fc.oneof(fc.constant('A'), fc.constant(1));

  const genVal = fc.oneof(
    fc.array(genSimpleVal, { minLength: 0, maxLength: 4 }).map(List),
    fc.array(genSimpleVal, { minLength: 0, maxLength: 4 }).map(Set),
    fc
      .array(fc.array(genSimpleVal, { minLength: 2, maxLength: 2 }), {
        minLength: 0,
        maxLength: 4,
      })
      .map(Map)
  );

  it('has symmetric equality', () => {
    fc.assert(
      fc.property(genVal, genVal, (a, b) => {
        expect(is(a, b)).toBe(is(b, a));
      }),
      { numRuns: 1000 }
    );
  });

  it('has hash symmetry', () => {
    fc.assert(
      fc.property(genVal, genVal, (a, b) => {
        if (is(a, b)) {
          expect(a.hashCode()).toBe(b.hashCode());
        }
      }),
      { numRuns: 1000 }
    );
  });

  describe('hash', () => {
    it('differentiates decimals', () => {
      expect(Seq([1.5]).hashCode()).not.toBe(Seq([1.6]).hashCode());
    });
  });
});
