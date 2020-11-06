/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

import { Collection, Map, Seq } from '../';

describe('groupBy', () => {
  it('groups keyed sequence', () => {
    const grouped = Seq({ a: 1, b: 2, c: 3, d: 4 }).groupBy((x) => x % 2);
    expect(grouped.toJS()).toEqual({ 1: { a: 1, c: 3 }, 0: { b: 2, d: 4 } });

    // Each group should be a keyed sequence, not an indexed sequence
    const firstGroup = grouped.get(1);
    expect(firstGroup && firstGroup.toArray()).toEqual([
      ['a', 1],
      ['c', 3],
    ]);
  });

  it('groups indexed sequence', () => {
    expect(
      Seq([1, 2, 3, 4, 5, 6])
        .groupBy((x) => x % 2)
        .toJS()
    ).toEqual({ 1: [1, 3, 5], 0: [2, 4, 6] });
  });

  it('groups to keys', () => {
    expect(
      Seq([1, 2, 3, 4, 5, 6])
        .groupBy((x) => (x % 2 ? 'odd' : 'even'))
        .toJS()
    ).toEqual({ odd: [1, 3, 5], even: [2, 4, 6] });
  });

  it('groups indexed sequences, maintaining indicies when keyed sequences', () => {
    expect(
      Seq([1, 2, 3, 4, 5, 6])
        .groupBy((x) => x % 2)
        .toJS()
    ).toEqual({ 1: [1, 3, 5], 0: [2, 4, 6] });
    expect(
      Seq([1, 2, 3, 4, 5, 6])
        .toKeyedSeq()
        .groupBy((x) => x % 2)
        .toJS()
    ).toEqual({ 1: { 0: 1, 2: 3, 4: 5 }, 0: { 1: 2, 3: 4, 5: 6 } });
  });

  it('has groups that can be mapped', () => {
    expect(
      Seq([1, 2, 3, 4, 5, 6])
        .groupBy((x) => x % 2)
        .map((group) => group.map((value) => value * 10))
        .toJS()
    ).toEqual({ 1: [10, 30, 50], 0: [20, 40, 60] });
  });

  it('returns an ordered map from an ordered collection', () => {
    const seq = Seq(['Z', 'Y', 'X', 'Z', 'Y', 'X']);
    expect(Collection.isOrdered(seq)).toBe(true);
    const seqGroups = seq.groupBy((x) => x);
    expect(Collection.isOrdered(seqGroups)).toBe(true);

    const map = Map({ x: 1, y: 2 });
    expect(Collection.isOrdered(map)).toBe(false);
    const mapGroups = map.groupBy((x) => x);
    expect(Collection.isOrdered(mapGroups)).toBe(false);
  });
});
