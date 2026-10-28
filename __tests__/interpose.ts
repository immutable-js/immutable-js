import { describe, expect, it } from '@jest/globals';
import { Range, Seq } from 'immutable';

describe('interpose', () => {
  it('separates with a value', () => {
    const range = Range(10, 15);
    const interposed = range.interpose(0);
    expect(interposed.toArray()).toEqual([10, 0, 11, 0, 12, 0, 13, 0, 14]);
  });

  it('can be iterated', () => {
    const range = Range(10, 15);
    const interposed = range.interpose(0);
    const values = interposed.values();
    expect(values.next()).toEqual({ value: 10, done: false });
    expect(values.next()).toEqual({ value: 0, done: false });
    expect(values.next()).toEqual({ value: 11, done: false });
    expect(values.next()).toEqual({ value: 0, done: false });
    expect(values.next()).toEqual({ value: 12, done: false });
    expect(values.next()).toEqual({ value: 0, done: false });
    expect(values.next()).toEqual({ value: 13, done: false });
    expect(values.next()).toEqual({ value: 0, done: false });
    expect(values.next()).toEqual({ value: 14, done: false });
    expect(values.next()).toEqual({ value: undefined, done: true });
  });

  it('keeps forward indices when iterated backwards', () => {
    // [1, 0, 2, 0, 3]: iterating backwards must yield keys 4, 3, 2, 1, 0.
    const expected = [
      [4, 3],
      [3, 0],
      [2, 2],
      [1, 0],
      [0, 1],
    ];

    // A filtered Seq has no known size. Iterating it backwards works out the
    // size, so each check below starts from a fresh one.
    const known = () => Seq([1, 2, 3]).interpose(0);
    const lazy = () =>
      Seq([1, 2, 3])
        .filter(() => true)
        .interpose(0);

    for (const seq of [known, lazy]) {
      expect(seq().lastIndexOf(1)).toBe(0);
      expect(seq().lastIndexOf(0)).toBe(3);
      expect(seq().findLastIndex((x) => x === 3)).toBe(4);
      expect(seq().findLastEntry((x) => x === 2)).toEqual([2, 2]);

      expect(
        seq().reduceRight<Array<[number, number]>>((acc, value, key) => {
          acc.push([key, value]);

          return acc;
        }, [])
      ).toEqual(expected);

      expect([...seq().toKeyedSeq().reverse().entries()]).toEqual(expected);
    }
  });
});
