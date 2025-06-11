import { update } from 'immutable';
import { describe, expect, it } from '@jest/globals';

describe('update', () => {
  it('for immutable structure', () => {
    const originalArray = ['dog', 'frog', 'cat'];
    expect(update(originalArray, 1, (val) => val?.toUpperCase())).toEqual([
      'dog',
      'FROG',
      'cat',
    ]);
    expect(originalArray).toEqual(['dog', 'frog', 'cat']);

    const originalObject = { x: 123, y: 456 };
    expect(update(originalObject, 'x', (val) => val * 6)).toEqual({
      x: 738,
      y: 456,
    });
    expect(originalObject).toEqual({ x: 123, y: 456 });
  });

  it('for Array', () => {
    const originalArray = ['dog', 'frog', 'cat'];
    expect(update(originalArray, 1, (val) => val?.toUpperCase())).toEqual([
      'dog',
      'FROG',
      'cat',
    ]);
    expect(originalArray).toEqual(['dog', 'frog', 'cat']);
  });

  it('for plain objects', () => {
    const originalObject = { x: 123, y: 456 };
    expect(update(originalObject, 'x', (val) => val * 6)).toEqual({
      x: 738,
      y: 456,
    });
    expect(originalObject).toEqual({ x: 123, y: 456 });
  });
});
