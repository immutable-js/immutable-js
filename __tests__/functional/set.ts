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
});
