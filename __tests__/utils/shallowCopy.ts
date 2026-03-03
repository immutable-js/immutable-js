import { describe, it, expect } from '@jest/globals';
import shallowCopy from '../../src/utils/shallowCopy';

describe('shallowCopy', () => {
  it('copies a plain object', () => {
    const obj = { a: 1, b: 2 };
    const copy = shallowCopy(obj);
    expect(copy).toEqual({ a: 1, b: 2 });
    expect(copy).not.toBe(obj);
  });

  it('copies an array', () => {
    const arr = [1, 2, 3];
    const copy = shallowCopy(arr);
    expect(copy).toEqual([1, 2, 3]);
    expect(copy).not.toBe(arr);
  });

  it('should not propagate __proto__ key from source object', () => {
    type User = { user: string; admin?: boolean };

    // @ts-expect-error -- testing prototype pollution
    delete Object.prototype.admin;

    // JSON.parse creates an own property named "__proto__" (not the actual prototype)
    const malicious = JSON.parse('{"user":"Eve","__proto__":{"admin":true}}');

    const copy = shallowCopy(malicious);

    // The copy should NOT have admin on its prototype chain
    expect((copy as User).admin).toBeUndefined();

    // Global Object prototype should NOT be polluted
    expect(({} as User).admin).toBeUndefined();

    // @ts-expect-error -- cleanup
    delete Object.prototype.admin;
  });

  it('should not propagate constructor key from source object', () => {
    type User = { user: string; admin?: boolean };

    const malicious: User = {
      user: 'Eve',
      // @ts-expect-error -- intentionally setting constructor to test pollution
      constructor: { prototype: { admin: true } },
    };

    const copy = shallowCopy(malicious);

    expect((copy as User).admin).toBeUndefined();

    // The constructor of a plain new object should still be Object
    expect({}.constructor).toBe(Object);
  });
});
