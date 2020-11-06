/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

import * as jasmineCheck from 'jasmine-check';
jasmineCheck.install();

import { Collection, List, Range, Seq } from '../';

describe('zip', () => {
  it('zips lists into a list of tuples', () => {
    expect(
      Seq([1, 2, 3])
        .zip(Seq([4, 5, 6]))
        .toArray()
    ).toEqual([
      [1, 4],
      [2, 5],
      [3, 6],
    ]);
  });

  it('zip results can be converted to JS', () => {
    const l1 = List([List([1]), List([2]), List([3])]);
    const l2 = List([List([4]), List([5]), List([6])]);
    const zipped = l1.zip(l2);
    expect(zipped).toEqual(
      List([
        [List([1]), List([4])],
        [List([2]), List([5])],
        [List([3]), List([6])],
      ])
    );
    expect(zipped.toJS()).toEqual([
      [[1], [4]],
      [[2], [5]],
      [[3], [6]],
    ]);
  });

  it('zips with infinite lists', () => {
    expect(
      Range()
        .zip(Seq(['A', 'B', 'C']))
        .toArray()
    ).toEqual([
      [0, 'A'],
      [1, 'B'],
      [2, 'C'],
    ]);
  });

  it('has unknown size when zipped with unknown size', () => {
    const seq = Range(0, 10);
    const zipped = seq.zip(seq.filter((n) => n % 2 === 0));
    expect(zipped.size).toBe(undefined);
    expect(zipped.count()).toBe(5);
  });

  check.it(
    'is always the size of the smaller sequence',
    [gen.notEmpty(gen.array(gen.posInt))],
    (lengths) => {
      const ranges = lengths.map((l) => Range(0, l));
      const first = ranges.shift();
      const zipped = first.zip.apply(first, ranges);
      const shortestLength = Math.min.apply(Math, lengths);
      expect(zipped.size).toBe(shortestLength);
    }
  );

  describe('zipWith', () => {
    it('zips with a custom function', () => {
      expect(
        Seq([1, 2, 3])
          .zipWith<number, number>((a, b) => a + b, Seq([4, 5, 6]))
          .toArray()
      ).toEqual([5, 7, 9]);
    });

    it('can zip to create immutable collections', () => {
      expect(
        Seq([1, 2, 3])
          .zipWith(
            function () {
              return List(arguments);
            },
            Seq([4, 5, 6]),
            Seq([7, 8, 9])
          )
          .toJS()
      ).toEqual([
        [1, 4, 7],
        [2, 5, 8],
        [3, 6, 9],
      ]);
    });
  });

  describe('zipAll', () => {
    it('fills in the empty zipped values with undefined', () => {
      expect(
        Seq([1, 2, 3])
          .zipAll(Seq([4]))
          .toArray()
      ).toEqual([
        [1, 4],
        [2, undefined],
        [3, undefined],
      ]);
    });

    check.it(
      'is always the size of the longest sequence',
      [gen.notEmpty(gen.array(gen.posInt))],
      (lengths) => {
        const ranges = lengths.map((l) => Range(0, l));
        const first = ranges.shift();
        const zipped = first.zipAll.apply(first, ranges);
        const longestLength = Math.max.apply(Math, lengths);
        expect(zipped.size).toBe(longestLength);
      }
    );
  });

  describe('interleave', () => {
    it('interleaves multiple collections', () => {
      expect(
        Seq([1, 2, 3])
          .interleave(Seq([4, 5, 6]), Seq([7, 8, 9]))
          .toArray()
      ).toEqual([1, 4, 7, 2, 5, 8, 3, 6, 9]);
    });

    it('stops at the shortest collection', () => {
      const i = Seq([1, 2, 3]).interleave(Seq([4, 5]), Seq([7, 8, 9]));
      expect(i.size).toBe(6);
      expect(i.toArray()).toEqual([1, 4, 7, 2, 5, 8]);
    });

    it('with infinite lists', () => {
      const r: Seq.Indexed<any> = Range();
      const i = r.interleave(Seq(['A', 'B', 'C']));
      expect(i.size).toBe(6);
      expect(i.toArray()).toEqual([0, 'A', 1, 'B', 2, 'C']);
    });
  });
});
