import { describe, expect, it } from '@jest/globals';
import { List, Map, fromJS, hasIn } from 'immutable';

describe('hasIn', () => {
  it('deep has', () => {
    const m = fromJS({ a: { b: { c: 10, d: undefined } } });
    expect(m.hasIn(['a', 'b', 'c'])).toEqual(true);
    expect(m.hasIn(['a', 'b', 'd'])).toEqual(true);
    expect(m.hasIn(['a', 'b', 'z'])).toEqual(false);
    expect(m.hasIn(['a', 'y', 'z'])).toEqual(false);
    expect(hasIn(m, ['a', 'b', 'c'])).toEqual(true);
    // @ts-expect-error -- the types refuse a path they know is wrong
    expect(hasIn(m, ['a', 'b', 'z'])).toEqual(false);
  });

  it('deep has with list as keyPath', () => {
    const m = fromJS({ a: { b: { c: 10 } } });
    expect(m.hasIn(fromJS(['a', 'b', 'c']))).toEqual(true);
    expect(m.hasIn(fromJS(['a', 'b', 'z']))).toEqual(false);
    expect(m.hasIn(fromJS(['a', 'y', 'z']))).toEqual(false);
    expect(hasIn(m, fromJS(['a', 'b', 'c']))).toEqual(true);
    expect(hasIn(m, fromJS(['a', 'y', 'z']))).toEqual(false);
  });

  it('deep has throws without list or array-like', () => {
    // @ts-expect-error -- test that runtime does throw
    expect(() => Map().hasIn(undefined)).toThrow(
      'Invalid keyPath: expected Ordered Collection or Array: undefined'
    );
    // @ts-expect-error -- test that runtime does throw
    expect(() => Map().hasIn({ a: 1, b: 2 })).toThrow(
      'Invalid keyPath: expected Ordered Collection or Array: [object Object]'
    );
    // @ts-expect-error -- test that runtime does throw
    expect(() => Map().hasIn('abc')).toThrow(
      'Invalid keyPath: expected Ordered Collection or Array: abc'
    );
    // @ts-expect-error -- test that runtime does throw
    expect(() => hasIn(Map(), 'abc')).toThrow(
      'Invalid keyPath: expected Ordered Collection or Array: abc'
    );
  });

  it('deep has does not throw if non-readable path', () => {
    const deep = Map({
      key: { regular: 'jsobj' },
      list: List([Map({ num: 10 })]),
    });
    // @ts-expect-error -- the types refuse a path they know is wrong
    expect(deep.hasIn(['key', 'foo', 'item'])).toBe(false);
    // @ts-expect-error -- the types refuse a path they know is wrong
    expect(deep.hasIn(['list', 0, 'num', 'badKey'])).toBe(false);
    // @ts-expect-error -- the types refuse a path they know is wrong
    expect(hasIn(deep, ['key', 'foo', 'item'])).toBe(false);
    // @ts-expect-error -- the types refuse a path they know is wrong
    expect(hasIn(deep, ['list', 0, 'num', 'badKey'])).toBe(false);
  });

  it('deep has in plain Object and Array', () => {
    const m = { a: { b: { c: [10, undefined], d: undefined } } };
    expect(hasIn(m, ['a', 'b', 'c', 0])).toEqual(true);
    expect(hasIn(m, ['a', 'b', 'c', 1])).toEqual(true);
    expect(hasIn(m, ['a', 'b', 'c', 2])).toEqual(false);
    expect(hasIn(m, ['a', 'b', 'd'])).toEqual(true);
    // @ts-expect-error -- the types refuse a path they know is wrong
    expect(hasIn(m, ['a', 'b', 'z'])).toEqual(false);
    // @ts-expect-error -- the types refuse a path they know is wrong
    expect(hasIn(m, ['a', 'b', 'z'])).toEqual(false);
  });
});
