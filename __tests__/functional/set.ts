import { describe, expect, it } from '@jest/globals';
import { set } from 'immutable';

describe('set', () => {
  it('for immutable structure', () => {
    const originalArray = ['dog', 'frog', 'cat'];
    expect(set(originalArray, 1, 'cow')).toEqual(['dog', 'cow', 'cat']);
    expect(set(originalArray, 4, 'cow')).toEqual([
      'dog',
      'frog',
      'cat',
      undefined,
      'cow',
    ]);
    expect(originalArray).toEqual(['dog', 'frog', 'cat']);

    const originalObject = { x: 123, y: 456 };
    expect(set(originalObject, 'x', 789)).toEqual({ x: 789, y: 456 });
    expect(set(originalObject, 'z', 789)).toEqual({ x: 123, y: 456, z: 789 });
    expect(originalObject).toEqual({ x: 123, y: 456 });
  });

  it('for Array', () => {
    const originalArray = ['dog', 'frog', 'cat'];
    expect(set(originalArray, 1, 'cow')).toEqual(['dog', 'cow', 'cat']);
    expect(set(originalArray, 4, 'cow')).toEqual([
      'dog',
      'frog',
      'cat',
      undefined,
      'cow',
    ]);
    expect(originalArray).toEqual(['dog', 'frog', 'cat']);
  });

  it('for plain objects', () => {
    const originalObject = { x: 123, y: 456 };
    expect(set(originalObject, 'x', 789)).toEqual({ x: 789, y: 456 });
    expect(set(originalObject, 'z', 789)).toEqual({ x: 123, y: 456, z: 789 });
    expect(originalObject).toEqual({ x: 123, y: 456 });
  });

  it('is not sensible to prototype pollution via set on plain object', () => {
    type User = { user: string; admin?: boolean };

    const obj: User = { user: 'Alice' };
    // Setting __proto__ key should not change the returned object's prototype chain
    // @ts-expect-error -- intentionally setting __proto__ to test prototype pollution
    const result = set(obj, '__proto__', { admin: true });

    // The returned copy should NOT have 'admin' accessible via prototype
    // @ts-expect-error -- testing prototype pollution
    expect(result.admin).toBeUndefined();
  });

  it('is not sensible to prototype pollution via set with JSON.parse source', () => {
    type User = { user: string; admin?: boolean };

    // JSON.parse creates __proto__ as an own property
    const malicious = JSON.parse(
      '{"user":"Eve","__proto__":{"admin":true}}'
    ) as User;
    // set on an object that already carries __proto__ from JSON.parse
    const result = set(malicious, 'user', 'Alice');

    // The returned copy should NOT have 'admin' accessible via prototype pollution
    expect(result.admin).toBeUndefined();
  });
});
