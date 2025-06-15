import { describe, expect, it } from '@jest/globals';
import { get, Map, List, Range } from 'immutable';
import { invariant } from '../../src/utils';

describe('get', () => {
  it('for immutable structure', () => {
    expect(get(Range(0, 100), 20)).toBe(20);
    expect(get(List(['dog', 'frog', 'cat']), 1)).toBe('frog');
    expect(get(List(['dog', 'frog', 'cat']), 20)).toBeUndefined();
    expect(get(List(['dog', 'frog', 'cat']), 20, 'ifNotSet')).toBe('ifNotSet');

    expect(get(Map({ x: 123, y: 456 }), 'x')).toBe(123);
  });

  it('for Array', () => {
    expect(get(['dog', 'frog', 'cat'], 1)).toBe('frog');
    expect(get(['dog', 'frog', 'cat'], 20)).toBeUndefined();
    expect(get(['dog', 'frog', 'cat'], 20, 'ifNotSet')).toBe('ifNotSet');
  });

  it('for plain objects', () => {
    expect(get({ x: 123, y: 456 }, 'x')).toBe(123);
    expect(get({ x: 123, y: 456 }, 'z', 'ifNotSet')).toBe('ifNotSet');

    expect(
      get(
        {
          x: 'xx',
          y: 'yy',
          get: function (this, key: string) {
            invariant(typeof this[key] === 'string', 'this[key] is a string');

            return this[key].toUpperCase();
          },
        },
        'x'
      )
    ).toBe('XX');
  });
});
