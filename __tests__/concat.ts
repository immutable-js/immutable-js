/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

import { is, List, Seq, Set } from 'immutable';

describe('concat', () => {
  it('concats two sequences', () => {
    const a = Seq([1, 2, 3]);
    const b = Seq([4, 5, 6]);
    expect(is(a.concat(b), Seq([1, 2, 3, 4, 5, 6]))).toBe(true);
    expect(a.concat(b).size).toBe(6);
    expect(a.concat(b).toArray()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('concats two object sequences', () => {
    const a = Seq({ a: 1, b: 2, c: 3 });
    const b = Seq({ d: 4, e: 5, f: 6 });
    expect(a.size).toBe(3);
    expect(a.concat(b).size).toBe(6);
    expect(a.concat(b).toObject()).toEqual({
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      e: 5,
      f: 6,
    });
  });

  it('concats objects to keyed seq', () => {
    const a = Seq({ a: 1, b: 2, c: 3 });
    const b = { d: 4, e: 5, f: 6 };
    expect(a.concat(b).toObject()).toEqual({
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      e: 5,
      f: 6,
    });
  });

  it('doesnt concat raw arrays to keyed seq', () => {
    const a = Seq({ a: 1, b: 2, c: 3 });
    const b = [4, 5, 6];
    expect(() => {
      a.concat(b as any).toJS();
    }).toThrow('Expected [K, V] tuple: 4');
  });

  it('concats arrays to indexed seq', () => {
    const a = Seq([1, 2, 3]);
    const b = [4, 5, 6];
    expect(a.concat(b).size).toBe(6);
    expect(a.concat(b).toArray()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('concats values', () => {
    const a = Seq([1, 2, 3]);
    expect(a.concat(4, 5, 6).size).toBe(6);
    expect(a.concat(4, 5, 6).toArray()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('doesnt concat objects to indexed seq', () => {
    const a = Seq([0, 1, 2, 3]);
    const b = { 4: 4 };
    const i = a.concat(b);
    expect(i.size).toBe(5);
    expect(i.get(4)).toBe(b);
    expect(i.toArray()).toEqual([0, 1, 2, 3, { 4: 4 }]);
  });

  it('concats multiple arguments', () => {
    const a = Seq([1, 2, 3]);
    const b = [4, 5, 6];
    const c = [7, 8, 9];
    expect(a.concat(b, c).size).toBe(9);
    expect(a.concat(b, c).toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('can concat itself!', () => {
    const a = Seq([1, 2, 3]);
    expect(a.concat(a, a).size).toBe(9);
    expect(a.concat(a, a).toArray()).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3]);
  });

  it('returns itself when concat does nothing', () => {
    const a = Seq([1, 2, 3]);
    const b = Seq();
    expect(a.concat()).toBe(a);
    expect(a.concat(b)).toBe(a);
    expect(b.concat(b)).toBe(b);
  });

  it('returns non-empty item when concat does nothing', () => {
    const a = Seq([1, 2, 3]);
    const b = Seq();
    expect(a.concat(b)).toBe(a);
    expect(b.concat(a)).toBe(a);
    expect(b.concat(b, b, b, a, b, b)).toBe(a);
  });

  it('always returns the same type', () => {
    const a = Set([1, 2, 3]);
    const b = List();
    expect(b.concat(a)).not.toBe(a);
    expect(List.isList(b.concat(a))).toBe(true);
    expect(b.concat(a)).toEqual(List([1, 2, 3]));
  });

  it('iterates repeated keys', () => {
    const a = Seq({ a: 1, b: 2, c: 3 });
    expect(a.concat(a, a).toObject()).toEqual({ a: 1, b: 2, c: 3 });
    expect(a.concat(a, a).valueSeq().toArray()).toEqual([
      1,
      2,
      3,
      1,
      2,
      3,
      1,
      2,
      3,
    ]);
    expect(a.concat(a, a).keySeq().toArray()).toEqual([
      'a',
      'b',
      'c',
      'a',
      'b',
      'c',
      'a',
      'b',
      'c',
    ]);
    expect(a.concat(a, a).toArray()).toEqual([
      ['a', 1],
      ['b', 2],
      ['c', 3],
      ['a', 1],
      ['b', 2],
      ['c', 3],
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]);
  });

  it('lazily reverses un-indexed sequences', () => {
    const a = Seq({ a: 1, b: 2, c: 3 });
    const b = Seq({ d: 4, e: 5, f: 6 });
    expect(a.concat(b).reverse().keySeq().toArray()).toEqual([
      'f',
      'e',
      'd',
      'c',
      'b',
      'a',
    ]);
  });

  it('lazily reverses indexed sequences', () => {
    const a = Seq([1, 2, 3]);
    expect(a.concat(a, a).reverse().size).toBe(9);
    expect(a.concat(a, a).reverse().toArray()).toEqual([
      3,
      2,
      1,
      3,
      2,
      1,
      3,
      2,
      1,
    ]);
  });

  it('lazily reverses indexed sequences with unknown size, maintaining indicies', () => {
    const a = Seq([1, 2, 3]).filter((x) => true);
    expect(a.size).toBe(undefined); // Note: lazy filter does not know what size in O(1).
    expect(a.concat(a, a).toKeyedSeq().reverse().size).toBe(undefined);
    expect(a.concat(a, a).toKeyedSeq().reverse().toArray()).toEqual([
      [8, 3],
      [7, 2],
      [6, 1],
      [5, 3],
      [4, 2],
      [3, 1],
      [2, 3],
      [1, 2],
      [0, 1],
    ]);
  });

  it('counts from the end of the indexed sequence on negative index', () => {
    const i = List.of(9, 5, 3, 1).map((x) => -x);
    expect(i.get(0)).toBe(-9);
    expect(i.get(-1)).toBe(-1);
    expect(i.get(-4)).toBe(-9);
    expect(i.get(-5, 888)).toBe(888);
  });
});
