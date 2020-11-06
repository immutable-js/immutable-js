/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

import * as jasmineCheck from 'jasmine-check';
import { List, Range, Seq } from '../';
jasmineCheck.install();

describe('slice', () => {
  it('slices a sequence', () => {
    expect(Seq([1, 2, 3, 4, 5, 6]).slice(2).toArray()).toEqual([3, 4, 5, 6]);
    expect(Seq([1, 2, 3, 4, 5, 6]).slice(2, 4).toArray()).toEqual([3, 4]);
    expect(Seq([1, 2, 3, 4, 5, 6]).slice(-3, -1).toArray()).toEqual([4, 5]);
    expect(Seq([1, 2, 3, 4, 5, 6]).slice(-1).toArray()).toEqual([6]);
    expect(Seq([1, 2, 3, 4, 5, 6]).slice(0, -1).toArray()).toEqual([
      1,
      2,
      3,
      4,
      5,
    ]);
  });

  it('creates an immutable stable sequence', () => {
    const seq = Seq([1, 2, 3, 4, 5, 6]);
    const sliced = seq.slice(2, -2);
    expect(sliced.toArray()).toEqual([3, 4]);
    expect(sliced.toArray()).toEqual([3, 4]);
    expect(sliced.toArray()).toEqual([3, 4]);
  });

  it('slices a sparse indexed sequence', () => {
    expect(
      Seq([
        1,
        undefined,
        2,
        undefined,
        3,
        undefined,
        4,
        undefined,
        5,
        undefined,
        6,
      ])
        .slice(1)
        .toArray()
    ).toEqual([
      undefined,
      2,
      undefined,
      3,
      undefined,
      4,
      undefined,
      5,
      undefined,
      6,
    ]);
    expect(
      Seq([
        1,
        undefined,
        2,
        undefined,
        3,
        undefined,
        4,
        undefined,
        5,
        undefined,
        6,
      ])
        .slice(2)
        .toArray()
    ).toEqual([2, undefined, 3, undefined, 4, undefined, 5, undefined, 6]);
    expect(
      Seq([
        1,
        undefined,
        2,
        undefined,
        3,
        undefined,
        4,
        undefined,
        5,
        undefined,
        6,
      ])
        .slice(3, -3)
        .toArray()
    ).toEqual([undefined, 3, undefined, 4, undefined]); // one trailing hole.
  });

  it('can maintain indices for an keyed indexed sequence', () => {
    expect(
      Seq([1, 2, 3, 4, 5, 6]).toKeyedSeq().slice(2).entrySeq().toArray()
    ).toEqual([
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
    ]);
    expect(
      Seq([1, 2, 3, 4, 5, 6]).toKeyedSeq().slice(2, 4).entrySeq().toArray()
    ).toEqual([
      [2, 3],
      [3, 4],
    ]);
  });

  it('slices an unindexed sequence', () => {
    expect(Seq({ a: 1, b: 2, c: 3 }).slice(1).toObject()).toEqual({
      b: 2,
      c: 3,
    });
    expect(Seq({ a: 1, b: 2, c: 3 }).slice(1, 2).toObject()).toEqual({ b: 2 });
    expect(Seq({ a: 1, b: 2, c: 3 }).slice(0, 2).toObject()).toEqual({
      a: 1,
      b: 2,
    });
    expect(Seq({ a: 1, b: 2, c: 3 }).slice(-1).toObject()).toEqual({ c: 3 });
    expect(Seq({ a: 1, b: 2, c: 3 }).slice(1, -1).toObject()).toEqual({ b: 2 });
  });

  it('is reversable', () => {
    expect(Seq([1, 2, 3, 4, 5, 6]).slice(2).reverse().toArray()).toEqual([
      6,
      5,
      4,
      3,
    ]);
    expect(Seq([1, 2, 3, 4, 5, 6]).slice(2, 4).reverse().toArray()).toEqual([
      4,
      3,
    ]);
    expect(
      Seq([1, 2, 3, 4, 5, 6])
        .toKeyedSeq()
        .slice(2)
        .reverse()
        .entrySeq()
        .toArray()
    ).toEqual([
      [5, 6],
      [4, 5],
      [3, 4],
      [2, 3],
    ]);
    expect(
      Seq([1, 2, 3, 4, 5, 6])
        .toKeyedSeq()
        .slice(2, 4)
        .reverse()
        .entrySeq()
        .toArray()
    ).toEqual([
      [3, 4],
      [2, 3],
    ]);
  });

  it('slices a list', () => {
    expect(List([1, 2, 3, 4, 5, 6]).slice(2).toArray()).toEqual([3, 4, 5, 6]);
    expect(List([1, 2, 3, 4, 5, 6]).slice(2, 4).toArray()).toEqual([3, 4]);
  });

  it('returns self for whole slices', () => {
    const s = Seq([1, 2, 3]);
    expect(s.slice(0)).toBe(s);
    expect(s.slice(0, 3)).toBe(s);
    expect(s.slice(-4, 4)).toBe(s);

    const v = List([1, 2, 3]);
    expect(v.slice(-4, 4)).toBe(v);
    expect(v.slice(-3)).toBe(v);
    expect(v.slice(-4, 4).toList()).toBe(v);
  });

  it('creates a sliced list in O(log32(n))', () => {
    expect(List([1, 2, 3, 4, 5]).slice(-3, -1).toList().toArray()).toEqual([
      3,
      4,
    ]);
  });

  it('has the same behavior as array slice in known edge cases', () => {
    const a = Range(0, 33).toArray();
    const v = List(a);
    expect(v.slice(31).toList().toArray()).toEqual(a.slice(31));
  });

  it('does not slice by floating-point numbers', () => {
    const seq = Seq([0, 1, 2, 3, 4, 5]);
    const sliced = seq.slice(0, 2.6);
    expect(sliced.size).toEqual(2);
    expect(sliced.toArray()).toEqual([0, 1]);
  });

  it('can create an iterator', () => {
    const seq = Seq([0, 1, 2, 3, 4, 5]);
    const iterFront = seq.slice(0, 2).values();
    expect(iterFront.next()).toEqual({ value: 0, done: false });
    expect(iterFront.next()).toEqual({ value: 1, done: false });
    expect(iterFront.next()).toEqual({ value: undefined, done: true });

    const iterMiddle = seq.slice(2, 4).values();
    expect(iterMiddle.next()).toEqual({ value: 2, done: false });
    expect(iterMiddle.next()).toEqual({ value: 3, done: false });
    expect(iterMiddle.next()).toEqual({ value: undefined, done: true });

    const iterTail = seq.slice(4, 123456).values();
    expect(iterTail.next()).toEqual({ value: 4, done: false });
    expect(iterTail.next()).toEqual({ value: 5, done: false });
    expect(iterTail.next()).toEqual({ value: undefined, done: true });
  });

  it('stops the entries iterator when the sequence has an undefined end', () => {
    let seq = Seq([0, 1, 2, 3, 4, 5]);
    // flatMap is lazy and thus the resulting sequence has no size.
    seq = seq.flatMap((a) => [a]);
    expect(seq.size).toEqual(undefined);

    const iterFront = seq.slice(0, 2).entries();
    expect(iterFront.next()).toEqual({ value: [0, 0], done: false });
    expect(iterFront.next()).toEqual({ value: [1, 1], done: false });
    expect(iterFront.next()).toEqual({ value: undefined, done: true });

    const iterMiddle = seq.slice(2, 4).entries();
    expect(iterMiddle.next()).toEqual({ value: [0, 2], done: false });
    expect(iterMiddle.next()).toEqual({ value: [1, 3], done: false });
    expect(iterMiddle.next()).toEqual({ value: undefined, done: true });

    const iterTail = seq.slice(4, 123456).entries();
    expect(iterTail.next()).toEqual({ value: [0, 4], done: false });
    expect(iterTail.next()).toEqual({ value: [1, 5], done: false });
    expect(iterTail.next()).toEqual({ value: undefined, done: true });
  });

  check.it(
    'works like Array.prototype.slice',
    [gen.int, gen.array(gen.oneOf([gen.int, gen.undefined]), 0, 3)],
    (valuesLen, args) => {
      const a = Range(0, valuesLen).toArray();
      const v = List(a);
      const slicedV = v.slice.apply(v, args);
      const slicedA = a.slice.apply(a, args);
      expect(slicedV.toArray()).toEqual(slicedA);
    }
  );

  check.it(
    'works like Array.prototype.slice on sparse array input',
    [
      gen.array(gen.array([gen.posInt, gen.int])),
      gen.array(gen.oneOf([gen.int, gen.undefined]), 0, 3),
    ],
    (entries, args) => {
      const a: Array<any> = [];
      entries.forEach((entry) => (a[entry[0]] = entry[1]));
      const s = Seq(a);
      const slicedS = s.slice.apply(s, args);
      const slicedA = a.slice.apply(a, args);
      expect(slicedS.toArray()).toEqual(slicedA);
    }
  );

  describe('take', () => {
    check.it(
      'takes the first n from a list',
      [gen.int, gen.posInt],
      (len, num) => {
        const a = Range(0, len).toArray();
        const v = List(a);
        expect(v.take(num).toArray()).toEqual(a.slice(0, num));
      }
    );

    it('creates an immutable stable sequence', () => {
      const seq = Seq([1, 2, 3, 4, 5, 6]);
      const sliced = seq.take(3);
      expect(sliced.toArray()).toEqual([1, 2, 3]);
      expect(sliced.toArray()).toEqual([1, 2, 3]);
      expect(sliced.toArray()).toEqual([1, 2, 3]);
    });

    it('converts to array with correct length', () => {
      const seq = Seq([1, 2, 3, 4, 5, 6]);
      const s1 = seq.take(3);
      const s2 = seq.take(10);
      const sn = seq.take(Infinity);
      const s3 = seq.filter((v) => v < 4).take(10);
      const s4 = seq.filter((v) => v < 4).take(2);
      expect(s1.toArray().length).toEqual(3);
      expect(s2.toArray().length).toEqual(6);
      expect(sn.toArray().length).toEqual(6);
      expect(s3.toArray().length).toEqual(3);
      expect(s4.toArray().length).toEqual(2);
    });
  });
});
