/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

import { fromJS, getIn, List, Map, Set } from 'immutable';

describe('getIn', () => {
  it('deep get', () => {
    const m = fromJS({ a: { b: { c: 10 } } });
    expect(m.getIn(['a', 'b', 'c'])).toEqual(10);
    expect(getIn(m, ['a', 'b', 'c'])).toEqual(10);
  });

  it('deep get with list as keyPath', () => {
    const m = fromJS({ a: { b: { c: 10 } } });
    expect(m.getIn(fromJS(['a', 'b', 'c']))).toEqual(10);
    expect(getIn(m, fromJS(['a', 'b', 'c']))).toEqual(10);
  });

  it('deep get throws without list or array-like', () => {
    // need to cast these as TypeScript first prevents us from such clownery.
    expect(() => Map().getIn(undefined as any)).toThrow(
      'Invalid keyPath: expected Ordered Collection or Array: undefined'
    );
    expect(() => Map().getIn({ a: 1, b: 2 } as any)).toThrow(
      'Invalid keyPath: expected Ordered Collection or Array: [object Object]'
    );
    expect(() => Map().getIn('abc' as any)).toThrow(
      'Invalid keyPath: expected Ordered Collection or Array: abc'
    );
    expect(() => getIn(Map(), 'abc' as any)).toThrow(
      'Invalid keyPath: expected Ordered Collection or Array: abc'
    );
  });

  it('deep get returns not found if path does not match', () => {
    const m = fromJS({ a: { b: { c: 10 } } });
    expect(m.getIn(['a', 'b', 'z'])).toEqual(undefined);
    expect(m.getIn(['a', 'b', 'z'], 123)).toEqual(123);
    expect(m.getIn(['a', 'y', 'z'])).toEqual(undefined);
    expect(m.getIn(['a', 'y', 'z'], 123)).toEqual(123);
    expect(getIn(m, ['a', 'y', 'z'])).toEqual(undefined);
    expect(getIn(m, ['a', 'y', 'z'], 123)).toEqual(123);
  });

  it('does not use notSetValue when path does exist but value is nullable', () => {
    const m = fromJS({ a: { b: { c: null, d: undefined } } });
    expect(m.getIn(['a', 'b', 'c'])).toEqual(null);
    expect(m.getIn(['a', 'b', 'd'])).toEqual(undefined);
    expect(m.getIn(['a', 'b', 'c'], 123)).toEqual(null);
    expect(m.getIn(['a', 'b', 'd'], 123)).toEqual(undefined);
    expect(getIn(m, ['a', 'b', 'c'], 123)).toEqual(null);
    expect(getIn(m, ['a', 'b', 'd'], 123)).toEqual(undefined);
  });

  it('deep get returns not found if path encounters non-data-structure', () => {
    const m = fromJS({ a: { b: { c: null, d: undefined } } });
    expect(m.getIn(['a', 'b', 'c', 'x'])).toEqual(undefined);
    expect(m.getIn(['a', 'b', 'c', 'x'], 123)).toEqual(123);
    expect(m.getIn(['a', 'b', 'd', 'x'])).toEqual(undefined);
    expect(m.getIn(['a', 'b', 'd', 'x'], 123)).toEqual(123);
    expect(getIn(m, ['a', 'b', 'd', 'x'])).toEqual(undefined);
    expect(getIn(m, ['a', 'b', 'd', 'x'], 123)).toEqual(123);

    expect(getIn('a', ['length'])).toEqual(undefined);
    expect(getIn(new Date(), ['getDate'])).toEqual(undefined);
  });

  it('gets in nested plain Objects and Arrays', () => {
    const m = List([{ key: ['item'] }]);
    expect(m.getIn([0, 'key', 0])).toEqual('item');
  });

  it('deep get returns not found if non-existing path in nested plain Object', () => {
    const deep = Map({
      key: { regular: 'jsobj' },
      list: List([Map({ num: 10 })]),
    });
    expect(deep.getIn(['key', 'foo', 'item'])).toBe(undefined);
    expect(deep.getIn(['key', 'foo', 'item'], 'notSet')).toBe('notSet');
    expect(deep.getIn(['list', 0, 'num', 'badKey'])).toBe(undefined);
    expect(deep.getIn(['list', 0, 'num', 'badKey'], 'notSet')).toBe('notSet');
  });

  it('gets in plain Objects and Arrays', () => {
    const m = [{ key: ['item'] }];
    expect(getIn(m, [0, 'key', 0])).toEqual('item');
  });

  it('deep get returns not found if non-existing path in plain Object', () => {
    const deep = { key: { regular: 'jsobj' }, list: [{ num: 10 }] };
    expect(getIn(deep, ['key', 'foo', 'item'])).toBe(undefined);
    expect(getIn(deep, ['key', 'foo', 'item'], 'notSet')).toBe('notSet');
    expect(getIn(deep, ['list', 0, 'num', 'badKey'])).toBe(undefined);
    expect(getIn(deep, ['list', 0, 'num', 'badKey'], 'notSet')).toBe('notSet');
  });
});
