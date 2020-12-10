/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

import { fromJS, hasIn, List, Map } from 'immutable';

describe('hasIn', () => {
  it('deep has', () => {
    const m = fromJS({ a: { b: { c: 10, d: undefined } } });
    expect(m.hasIn(['a', 'b', 'c'])).toEqual(true);
    expect(m.hasIn(['a', 'b', 'd'])).toEqual(true);
    expect(m.hasIn(['a', 'b', 'z'])).toEqual(false);
    expect(m.hasIn(['a', 'y', 'z'])).toEqual(false);
    expect(hasIn(m, ['a', 'b', 'c'])).toEqual(true);
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
    // need to cast these as TypeScript first prevents us from such clownery.
    expect(() => Map().hasIn(undefined as any)).toThrow(
      'Invalid keyPath: expected Ordered Collection or Array: undefined'
    );
    expect(() => Map().hasIn({ a: 1, b: 2 } as any)).toThrow(
      'Invalid keyPath: expected Ordered Collection or Array: [object Object]'
    );
    expect(() => Map().hasIn('abc' as any)).toThrow(
      'Invalid keyPath: expected Ordered Collection or Array: abc'
    );
    expect(() => hasIn(Map(), 'abc' as any)).toThrow(
      'Invalid keyPath: expected Ordered Collection or Array: abc'
    );
  });

  it('deep has does not throw if non-readable path', () => {
    const deep = Map({
      key: { regular: 'jsobj' },
      list: List([Map({ num: 10 })]),
    });
    expect(deep.hasIn(['key', 'foo', 'item'])).toBe(false);
    expect(deep.hasIn(['list', 0, 'num', 'badKey'])).toBe(false);
    expect(hasIn(deep, ['key', 'foo', 'item'])).toBe(false);
    expect(hasIn(deep, ['list', 0, 'num', 'badKey'])).toBe(false);
  });

  it('deep has in plain Object and Array', () => {
    const m = { a: { b: { c: [10, undefined], d: undefined } } };
    expect(hasIn(m, ['a', 'b', 'c', 0])).toEqual(true);
    expect(hasIn(m, ['a', 'b', 'c', 1])).toEqual(true);
    expect(hasIn(m, ['a', 'b', 'c', 2])).toEqual(false);
    expect(hasIn(m, ['a', 'b', 'd'])).toEqual(true);
    expect(hasIn(m, ['a', 'b', 'z'])).toEqual(false);
    expect(hasIn(m, ['a', 'b', 'z'])).toEqual(false);
  });
});
