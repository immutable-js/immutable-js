import { describe, it, expect } from '@jest/globals';
import arrCopy from '../../src/utils/arrCopy';

describe('arrCopy', () => {
  it('should copy an array without offset', () => {
    const arr = [1, 2, 3, 4];
    const result = arrCopy(arr);
    expect(result).toEqual([1, 2, 3, 4]);
    expect(result).not.toBe(arr); // Should be a new array
  });

  it('should copy an array with offset', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = arrCopy(arr, 2);
    expect(result).toEqual([3, 4, 5]);
  });

  it('should return an empty array if offset >= arr.length', () => {
    const arr = [1, 2, 3];
    expect(arrCopy(arr, 3)).toEqual([]);
    expect(arrCopy(arr, 5)).toEqual([]);
  });

  it('should handle empty array', () => {
    expect(arrCopy([])).toEqual([]);
    expect(arrCopy([], 2)).toEqual([]);
  });

  it('should copy array of objects by reference', () => {
    const obj1 = { a: 1 };
    const obj2 = { b: 2 };
    const arr = [obj1, obj2];
    const result = arrCopy(arr);
    expect(result).toEqual([obj1, obj2]);
    expect(result[0]).toBe(obj1);
    expect(result[1]).toBe(obj2);
  });
});
