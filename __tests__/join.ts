import { describe, expect, it } from '@jest/globals';
import { Seq } from 'immutable';
import fc from 'fast-check';

describe('join', () => {
  it('string-joins sequences with commas by default', () => {
    expect(Seq([1, 2, 3, 4, 5]).join()).toBe('1,2,3,4,5');
  });

  it('string-joins sequences with any string', () => {
    expect(Seq([1, 2, 3, 4, 5]).join('foo')).toBe('1foo2foo3foo4foo5');
  });

  it('string-joins sequences with empty string', () => {
    expect(Seq([1, 2, 3, 4, 5]).join('')).toBe('12345');
  });

  it('joins sparse-sequences like Array.join', () => {
    const a = [
      1,
      undefined,
      2,
      undefined,
      3,
      undefined,
      4,
      undefined,
      5,
      undefined,
      undefined,
    ];
    expect(Seq(a).join()).toBe(a.join());
  });

  const genPrimitive = fc.oneof(
    fc.string(),
    fc.integer(),
    fc.boolean(),
    fc.constant(null),
    fc.constant(undefined),
    fc.constant(NaN)
  );

  it('behaves the same as Array.join', () => {
    fc.assert(
      fc.property(fc.array(genPrimitive), genPrimitive, (array, joiner) => {
        // @ts-expect-error unexpected values for typescript joiner, but valid at runtime despite the unexpected errors
        expect(Seq(array).join(joiner)).toBe(array.join(joiner));
      })
    );
  });
});
