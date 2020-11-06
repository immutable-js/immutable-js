/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

import { List, OrderedMap, Range, Seq } from '../';

describe('sort', () => {
  it('sorts a sequence', () => {
    expect(Seq([4, 5, 6, 3, 2, 1]).sort().toArray()).toEqual([
      1,
      2,
      3,
      4,
      5,
      6,
    ]);
  });

  it('sorts a list', () => {
    expect(List([4, 5, 6, 3, 2, 1]).sort().toArray()).toEqual([
      1,
      2,
      3,
      4,
      5,
      6,
    ]);
  });

  it('sorts undefined values last', () => {
    expect(
      List([4, undefined, 5, 6, 3, undefined, 2, 1]).sort().toArray()
    ).toEqual([1, 2, 3, 4, 5, 6, undefined, undefined]);
  });

  it('sorts a keyed sequence', () => {
    expect(
      Seq({ z: 1, y: 2, x: 3, c: 3, b: 2, a: 1 }).sort().entrySeq().toArray()
    ).toEqual([
      ['z', 1],
      ['a', 1],
      ['y', 2],
      ['b', 2],
      ['x', 3],
      ['c', 3],
    ]);
  });

  it('sorts an OrderedMap', () => {
    expect(
      OrderedMap({ z: 1, y: 2, x: 3, c: 3, b: 2, a: 1 })
        .sort()
        .entrySeq()
        .toArray()
    ).toEqual([
      ['z', 1],
      ['a', 1],
      ['y', 2],
      ['b', 2],
      ['x', 3],
      ['c', 3],
    ]);
  });

  it('accepts a sort function', () => {
    expect(
      Seq([4, 5, 6, 3, 2, 1])
        .sort((a, b) => b - a)
        .toArray()
    ).toEqual([6, 5, 4, 3, 2, 1]);
  });

  it('sorts by using a mapper', () => {
    expect(
      Range(1, 10)
        .sortBy((v) => v % 3)
        .toArray()
    ).toEqual([3, 6, 9, 1, 4, 7, 2, 5, 8]);
  });

  it('sorts by using a mapper and a sort function', () => {
    expect(
      Range(1, 10)
        .sortBy(
          (v) => v % 3,
          (a: number, b: number) => b - a
        )
        .toArray()
    ).toEqual([2, 5, 8, 1, 4, 7, 3, 6, 9]);
  });
});
