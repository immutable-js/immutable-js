import { describe, expect, it } from '@jest/globals';
import { update } from 'immutable';

describe('update', () => {
  it('for immutable structure', () => {
    const originalArray = ['dog', 'frog', 'cat'];
    expect(update(originalArray, 1, val => val?.toUpperCase())).toEqual([
      'dog',
      'FROG',
      'cat',
    ]);
    expect(originalArray).toEqual(['dog', 'frog', 'cat']);

    const originalObject = { x: 123, y: 456 };
    expect(update(originalObject, 'x', val => val * 6)).toEqual({
      x: 738,
      y: 456,
    });
    expect(originalObject).toEqual({ x: 123, y: 456 });
  });

  it('for Array', () => {
    const originalArray = ['dog', 'frog', 'cat'];
    expect(update(originalArray, 1, val => val?.toUpperCase())).toEqual([
      'dog',
      'FROG',
      'cat',
    ]);
    expect(originalArray).toEqual(['dog', 'frog', 'cat']);
  });

  it('for plain objects', () => {
    const originalObject = { x: 123, y: 456 };
    expect(update(originalObject, 'x', val => val * 6)).toEqual({
      x: 738,
      y: 456,
    });
    expect(originalObject).toEqual({ x: 123, y: 456 });
  });

  it('is not sensible to prototype pollution via update on plain object', () => {
    type User = { user: string; admin?: boolean };

    const obj: User = { user: 'Alice' };
    // @ts-expect-error -- intentionally setting __proto__ to test prototype pollution
    const result = update(obj, '__proto__', () => ({
      admin: true,
    })) as unknown as User;

    // The returned copy should NOT have 'admin' accessible via prototype
    expect(result.admin).toBeUndefined();
  });

  it('is not sensible to prototype pollution via update with JSON.parse source', () => {
    type User = { user: string; admin?: boolean };

    // JSON.parse creates __proto__ as an own property
    const malicious = JSON.parse('{"user":"Eve","__proto__":{"admin":true}}');
    const result = update(malicious, 'user', () => 'Alice') as User;

    // The returned copy (via shallowCopy) should NOT have 'admin' via prototype
    expect(result.admin).toBeUndefined();
  });
});
