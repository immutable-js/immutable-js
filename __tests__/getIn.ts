/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

import { fromJS, List, Map, Set } from '../';

describe('getIn', () => {

  it('deep get', () => {
    const m = fromJS({a: {b: {c: 10}}});
    expect(m.getIn(['a', 'b', 'c'])).toEqual(10);
  });

  it('deep get with list as keyPath', () => {
    const m = fromJS({a: {b: {c: 10}}});
    expect(m.getIn(fromJS(['a', 'b', 'c']))).toEqual(10);
  });

  it('deep get throws without list or array-like', () => {
    // need to cast these as TypeScript first prevents us from such clownery.
    expect(() =>
      Map().getIn(undefined as any),
    ).toThrow('Invalid keyPath: expected Ordered Collection or Array: undefined');
    expect(() =>
      Map().getIn({ a: 1, b: 2 } as any),
    ).toThrow('Invalid keyPath: expected Ordered Collection or Array: [object Object]');
    expect(() =>
      Map().getIn('abc' as any),
    ).toThrow('Invalid keyPath: expected Ordered Collection or Array: abc');
  });

  function withWarnings(fn) {
    const realWarn = console.warn;
    const warnings: Array<any> = [];
    console.warn = w => warnings.push(w);
    try {
      fn(warnings);
    } finally {
      console.warn = realWarn;
    }
  }

  it('deep get throws if non-readable path', withWarnings(warnings => {
    const deep = Map({ key: { regular: "jsobj" }, list: List([ Map({num: 10}) ]) });
    deep.getIn(["key", "foo", "item"]);
    expect(warnings.length).toBe(1);
    expect(warnings[0]).toBe(
      'Invalid keyPath: Value at ["key"] does not have a .get() method: [object Object]' +
      '\nThis warning will throw in a future version',
    );

    warnings.length = 0;
    deep.getIn(["list", 0, "num", "badKey"]);
    expect(warnings.length).toBe(1);
    expect(warnings[0]).toBe(
      'Invalid keyPath: Value at ["list",0,"num"] does not have a .get() method: 10' +
      '\nThis warning will throw in a future version',
    );
  }));

  it('deep get returns not found if path does not match', () => {
    const m = fromJS({a: {b: {c: 10}}});
    expect(m.getIn(['a', 'b', 'z'])).toEqual(undefined);
    expect(m.getIn(['a', 'b', 'z'], 123)).toEqual(123);
    expect(m.getIn(['a', 'y', 'z'])).toEqual(undefined);
    expect(m.getIn(['a', 'y', 'z'], 123)).toEqual(123);
  });

  it('does not use notSetValue when path does exist but value is nullable', () => {
    const m = fromJS({a: {b: {c: null, d: undefined}}});
    expect(m.getIn(['a', 'b', 'c'])).toEqual(null);
    expect(m.getIn(['a', 'b', 'd'])).toEqual(undefined);
    expect(m.getIn(['a', 'b', 'c'], 123)).toEqual(null);
    expect(m.getIn(['a', 'b', 'd'], 123)).toEqual(undefined);
  });

  it('deep get returns not found if path encounters null or undefined', withWarnings(warnings => {
    const m = fromJS({a: {b: {c: null, d: undefined}}});
    expect(m.getIn(['a', 'b', 'c', 'x'])).toEqual(undefined);
    expect(m.getIn(['a', 'b', 'd', 'x'])).toEqual(undefined);
    expect(m.getIn(['a', 'b', 'c', 'x'], 123)).toEqual(123);
    expect(m.getIn(['a', 'b', 'd', 'x'], 123)).toEqual(123);
    expect(warnings.length).toBe(0);
  }));
});
