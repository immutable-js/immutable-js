import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  Map as IMap,
  Set as ISet,
  List,
  Seq,
  isAssociative,
  isIndexed,
  isKeyed,
  isList,
  isMap,
  isSeq,
  isSet,
} from 'immutable';

describe('partition', () => {
  let isOdd: jest.Mock<(x: number) => number>;

  beforeEach(() => {
    isOdd = jest.fn((x) => x % 2);
  });

  it('partitions keyed sequence', () => {
    const parts = Seq({ a: 1, b: 2, c: 3, d: 4 }).partition(isOdd);
    expect(isKeyed(parts[0])).toBe(true);
    expect(isSeq(parts[0])).toBe(true);
    expect(parts.map((part) => part.toJS())).toEqual([
      { b: 2, d: 4 },
      { a: 1, c: 3 },
    ]);
    expect(isOdd.mock.calls.length).toBe(4);

    // Each group should be a keyed sequence, not an indexed sequence
    const trueGroup = parts[1];
    expect(trueGroup && trueGroup.toArray()).toEqual([
      ['a', 1],
      ['c', 3],
    ]);
  });

  it('partitions indexed sequence', () => {
    const parts = Seq([1, 2, 3, 4, 5, 6]).partition(isOdd);
    expect(isIndexed(parts[0])).toBe(true);
    expect(isSeq(parts[0])).toBe(true);
    expect(parts.map((part) => part.toJS())).toEqual([
      [2, 4, 6],
      [1, 3, 5],
    ]);
    expect(isOdd.mock.calls.length).toBe(6);
  });

  it('partitions set sequence', () => {
    const parts = Seq.Set([1, 2, 3, 4, 5, 6]).partition(isOdd);
    expect(isAssociative(parts[0])).toBe(false);
    expect(isSeq(parts[0])).toBe(true);
    expect(parts.map((part) => part.toJS())).toEqual([
      [2, 4, 6],
      [1, 3, 5],
    ]);
    expect(isOdd.mock.calls.length).toBe(6);
  });

  it('partitions keyed collection', () => {
    const parts = IMap({ a: 1, b: 2, c: 3, d: 4 }).partition(isOdd);
    expect(isMap(parts[0])).toBe(true);
    expect(isSeq(parts[0])).toBe(false);
    expect(parts.map((part) => part.toJS())).toEqual([
      { b: 2, d: 4 },
      { a: 1, c: 3 },
    ]);
    expect(isOdd.mock.calls.length).toBe(4);

    // Each group should be a keyed collection, not an indexed collection
    const trueGroup = parts[1];
    expect(trueGroup && trueGroup.toArray()).toEqual([
      ['a', 1],
      ['c', 3],
    ]);
  });

  it('partitions indexed collection', () => {
    const parts = List([1, 2, 3, 4, 5, 6]).partition(isOdd);
    expect(isList(parts[0])).toBe(true);
    expect(isSeq(parts[0])).toBe(false);
    expect(parts.map((part) => part.toJS())).toEqual([
      [2, 4, 6],
      [1, 3, 5],
    ]);
    expect(isOdd.mock.calls.length).toBe(6);
  });

  it('partitions set collection', () => {
    const parts = ISet([1, 2, 3, 4, 5, 6]).partition(isOdd);
    expect(isSet(parts[0])).toBe(true);
    expect(isSeq(parts[0])).toBe(false);
    expect(parts.map((part) => part.toJS().sort())).toEqual([
      [2, 4, 6],
      [1, 3, 5],
    ]);
    expect(isOdd.mock.calls.length).toBe(6);
  });
});
