import { describe, expect, it } from '@jest/globals';
import { Seq } from 'immutable';

describe('IndexedSequence', () => {
  it('maintains skipped offset', () => {
    const seq = Seq(['A', 'B', 'C', 'D', 'E']);

    // This is what we expect for IndexedSequences
    const operated = seq.skip(1);
    expect(operated.entrySeq().toArray()).toEqual([
      [0, 'B'],
      [1, 'C'],
      [2, 'D'],
      [3, 'E'],
    ]);

    expect(operated.first()).toEqual('B');
  });

  it('reverses correctly', () => {
    const seq = Seq(['A', 'B', 'C', 'D', 'E']);

    // This is what we expect for IndexedSequences
    const operated = seq.reverse();
    expect(operated.get(0)).toEqual('E');
    expect(operated.get(1)).toEqual('D');
    expect(operated.get(4)).toEqual('A');

    expect(operated.first()).toEqual('E');
    expect(operated.last()).toEqual('A');
  });

  it('can be iterated in reverse through a lazy chain', () => {
    // Regression: reverseFactory's __iterator is an arrow function, so `this`
    // is NOT the reversed sequence there — it must read `reversedSequence.size`
    // rather than `this.size`. The bug only surfaces when the reversed indexed
    // Seq is iterated *backwards* (reverse=true) via the iterator protocol,
    // which a wrapping `.reverse()` triggers on the inner sequence.
    // The `.map()` in between prevents the two reverses from collapsing.
    const seq = Seq([1, 2, 3])
      .reverse()
      .map((x) => x * 10)
      .reverse();

    // Consuming via the iterator protocol (not toArray, which uses __iterate)
    // is what exercised the broken `this.size` path.
    expect([...seq]).toEqual([10, 20, 30]);
    expect([...seq.entries()]).toEqual([
      [0, 10],
      [1, 20],
      [2, 30],
    ]);
  });

  it('negative indexes correctly', () => {
    const seq = Seq(['A', 'B', 'C', 'D', 'E']);

    expect(seq.first()).toEqual('A');
    expect(seq.last()).toEqual('E');
    expect(seq.get(-0)).toEqual('A');
    expect(seq.get(2)).toEqual('C');
    expect(seq.get(-2)).toEqual('D');

    const indexes = seq.keySeq();
    expect(indexes.first()).toEqual(0);
    expect(indexes.last()).toEqual(4);
    expect(indexes.get(-0)).toEqual(0);
    expect(indexes.get(2)).toEqual(2);
    expect(indexes.get(-2)).toEqual(3);
  });
});
