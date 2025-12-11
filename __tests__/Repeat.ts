import { describe, expect, it } from '@jest/globals';
import { Repeat } from 'immutable';

describe('Repeat', () => {
  it('constructor provides different instances', () => {
    expect(Repeat('wtf')).not.toBe(Repeat('wtf'));
    // Value equality is not computable for infinite Seq
    expect(Repeat('wtf', 2)).not.toBe(Repeat('wtf', 2));
    expect(Repeat('wtf', 2)).toEqual(Repeat('wtf', 2));
  });

  it('fixed repeat', () => {
    const v = Repeat('wtf', 3);
    expect(v.size).toBe(3);
    expect(v.first()).toBe('wtf');
    expect(v.rest().toArray()).toEqual(['wtf', 'wtf']);
    expect(v.last()).toBe('wtf');
    expect(v.butLast().toArray()).toEqual(['wtf', 'wtf']);
    expect(v.toArray()).toEqual(['wtf', 'wtf', 'wtf']);
    expect(v.join()).toEqual('wtf,wtf,wtf');
  });

  it('does not claim to be equal to undefined', () => {
    expect(Repeat(1).equals(undefined)).toEqual(false);
  });
});
