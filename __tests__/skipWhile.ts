import { describe, expect, it, jest } from '@jest/globals';
import { Seq } from 'immutable';

describe('skipWhile', () => {
  it.each(['skipWhile', 'skipUntil'] as const)(
    '%s renumbers indexed iterator keys',
    (method) => {
      const seq = Seq(['A', 'B', 'C'])[method]((value) =>
        method === 'skipWhile' ? value === 'A' : value !== 'A'
      );

      expect([...seq.keys()]).toEqual([0, 1]);
      expect([...seq.values()]).toEqual(['B', 'C']);
      expect([...seq.entries()]).toEqual([
        [0, 'B'],
        [1, 'C'],
      ]);
      expect(seq.entrySeq().toArray()).toEqual([...seq.entries()]);
    }
  );

  it('can be iterated after a chained lazy operation', () => {
    const seq = Seq(['A', 'B', 'C']).skipWhile((value) => value === 'A');

    expect([...seq.map((value) => value.toLowerCase())]).toEqual(['b', 'c']);
    expect([...seq.filter((value) => value !== 'B').entries()]).toEqual([
      [0, 'C'],
    ]);
  });

  it('is equal to a sequence with the same values', () => {
    const seq = Seq(['A', 'B', 'C']).skipWhile((value) => value === 'A');

    expect(seq.equals(Seq(['B', 'C']))).toBe(true);
    expect(Seq(['B', 'C']).equals(seq)).toBe(true);
    expect(seq.equals(Seq(['B', 'D']))).toBe(false);
  });

  it.each(['keys', 'values', 'entries'] as const)(
    '%s finishes when the input is empty or entirely skipped',
    (method) => {
      for (const input of [[], [1, 2, 3]]) {
        const seq = Seq(input).skipWhile(() => true);
        const iterator = seq[method]();
        expect(iterator.next()).toEqual({ value: undefined, done: true });
        expect(iterator.next()).toEqual({ value: undefined, done: true });
      }
    }
  );

  it('keeps all values when the predicate is initially false', () => {
    const seq = Seq(['A', 'B']).skipWhile(() => false);
    expect([...seq.keys()]).toEqual([0, 1]);
    expect([...seq.values()]).toEqual(['A', 'B']);
    expect([...seq.entries()]).toEqual([
      [0, 'A'],
      [1, 'B'],
    ]);
  });

  it('preserves keyed iterator keys', () => {
    const seq = Seq({ a: 1, b: 2, c: 3 }).skipWhile((value) => value < 2);
    expect([...seq.keys()]).toEqual(['b', 'c']);
    expect([...seq.values()]).toEqual([2, 3]);
    expect([...seq.entries()]).toEqual([
      ['b', 2],
      ['c', 3],
    ]);
  });

  it('only consumes the input and calls the predicate as needed', () => {
    const next = jest.fn<() => IteratorResult<number>>();
    next
      .mockReturnValueOnce({ value: 10, done: false })
      .mockReturnValueOnce({ value: 20, done: false })
      .mockReturnValueOnce({ value: 30, done: false })
      .mockReturnValue({ value: undefined, done: true });
    const predicate = jest.fn((value: number) => value < 20);
    const seq = Seq.Indexed<number>({
      [Symbol.iterator]: () => ({ next }),
    }).skipWhile(predicate);
    const iterator = seq.entries();

    expect(next).not.toHaveBeenCalled();
    expect(iterator.next()).toEqual({ value: [0, 20], done: false });
    expect(next).toHaveBeenCalledTimes(2);
    expect(predicate).toHaveBeenCalledTimes(2);
    expect(iterator.next()).toEqual({ value: [1, 30], done: false });
    expect(next).toHaveBeenCalledTimes(3);
    expect(predicate).toHaveBeenCalledTimes(2);
    expect(iterator.next()).toEqual({ value: undefined, done: true });
  });
});
