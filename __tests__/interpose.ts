import { describe, expect, it } from '@jest/globals';
import { Range } from 'immutable';

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
});
