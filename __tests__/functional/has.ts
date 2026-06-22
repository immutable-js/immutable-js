import { List, Map, Range, has } from 'immutable';
import { describe, expect, it } from '@jest/globals';

describe('has', () => {
  it('for immutable structure', () => {
    expect(has(Range(0, 100), 20)).toBe(true);
    expect(has(List(['dog', 'frog', 'cat']), 1)).toBe(true);
    expect(has(List(['dog', 'frog', 'cat']), 20)).toBe(false);

    expect(has(Map({ x: 123, y: 456 }), 'x')).toBe(true);
  });
  it('for Array', () => {
    expect(has(['dog', 'frog', 'cat'], 1)).toBe(true);
    expect(has(['dog', 'frog', 'cat'], 20)).toBe(false);
  });

  it('for plain objects', () => {
    expect(has({ x: 123, y: 456 }, 'x')).toBe(true);
    expect(has({ x: 123, y: 456 }, 'z')).toBe(false);
  });
});
