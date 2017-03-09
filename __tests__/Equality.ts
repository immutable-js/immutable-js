import * as jasmineCheck from 'jasmine-check';
import { is, List, Map, Seq, Set } from '../';
jasmineCheck.install();

describe('Equality', () => {
  function expectIs(left, right) {
    let comparison = is(left, right);
    expect(comparison).toBe(true);
    let commutative = is(right, left);
    expect(commutative).toBe(true);
  }

  function expectIsNot(left, right) {
    let comparison = is(left, right);
    expect(comparison).toBe(false);
    let commutative = is(right, left);
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

    let str = 'hello';
    expectIs(str, str);
    expectIs(str, 'hello');
    expectIsNot('hello', 'HELLO');
    expectIsNot('hello', 'goodbye');

    let array = [1, 2, 3];
    expectIs(array, array);
    expectIsNot(array, [1, 2, 3]);

    let object = { key: 'value' };
    expectIs(object, object);
    expectIsNot(object, { key: 'value' });
  });

  it('dereferences things', () => {
    let ptrA = { foo: 1 }, ptrB = { foo: 2 };
    expectIsNot(ptrA, ptrB);
    ptrA.valueOf = (ptrB.valueOf = function () {
      return 5;
    });
    expectIs(ptrA, ptrB);
    let object = { key: 'value' };
    ptrA.valueOf = (ptrB.valueOf = function () {
      return object;
    });
    expectIs(ptrA, ptrB);
    ptrA.valueOf = (ptrB.valueOf = function () {
      return null;
    });
    expectIs(ptrA, ptrB);
    ptrA.valueOf = (ptrB.valueOf = function () {
      return void 0;
    });
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
    let arraySeq = Seq.of(1, 2, 3);
    let arraySeq2 = Seq([1, 2, 3]);
    expectIs(arraySeq, arraySeq);
    expectIs(arraySeq, Seq.of(1, 2, 3));
    expectIs(arraySeq2, arraySeq2);
    expectIs(arraySeq2, Seq([1, 2, 3]));
    expectIsNot(arraySeq, [1, 2, 3]);
    expectIsNot(arraySeq2, [1, 2, 3]);
    expectIs(arraySeq, arraySeq2);
    expectIs(arraySeq, arraySeq.map(x => x));
    expectIs(arraySeq2, arraySeq2.map(x => x));
  });

  it('compares lists', () => {
    let list = List.of(1, 2, 3);
    expectIs(list, list);
    expectIsNot(list, [1, 2, 3]);

    expectIs(list, Seq.of(1, 2, 3));
    expectIs(list, List.of(1, 2, 3));

    let listLonger = list.push(4);
    expectIsNot(list, listLonger);
    let listShorter = listLonger.pop();
    expect(list === listShorter).toBe(false);
    expectIs(list, listShorter);
  });

  let genSimpleVal = gen.returnOneOf(['A', 1]);

  let genVal = gen.oneOf([
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
    },
  );

  check.it('has hash equality', { times: 1000 }, [genVal, genVal], (a, b) => {
    if (is(a, b)) {
      expect(a.hashCode()).toBe(b.hashCode());
    }
  });

  describe('hash', () => {
    it('differentiates decimals', () => {
      expect(Seq.of(1.5).hashCode()).not.toBe(Seq.of(1.6).hashCode());
    });
  });
});
