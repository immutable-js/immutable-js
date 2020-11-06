/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

import { fromJS, List, Map, removeIn, Seq, Set, setIn, updateIn } from '../';

describe('updateIn', () => {
  it('deep edit', () => {
    const m = fromJS({ a: { b: { c: 10 } } });
    expect(m.updateIn(['a', 'b', 'c'], (value) => value * 2).toJS()).toEqual({
      a: { b: { c: 20 } },
    });
  });

  it('deep edit with list as keyPath', () => {
    const m = fromJS({ a: { b: { c: 10 } } });
    expect(
      m.updateIn(fromJS(['a', 'b', 'c']), (value) => value * 2).toJS()
    ).toEqual({ a: { b: { c: 20 } } });
  });

  it('deep edit in raw JS', () => {
    const m = { a: { b: { c: [10] } } };
    expect(updateIn(m, ['a', 'b', 'c', 0], (value) => value * 2)).toEqual({
      a: { b: { c: [20] } },
    });
  });

  it('deep edit throws without list or array-like', () => {
    // need to cast these as TypeScript first prevents us from such clownery.
    expect(() => Map().updateIn(undefined as any, (x) => x)).toThrow(
      'Invalid keyPath: expected Ordered Collection or Array: undefined'
    );
    expect(() => Map().updateIn({ a: 1, b: 2 } as any, (x) => x)).toThrow(
      'Invalid keyPath: expected Ordered Collection or Array: [object Object]'
    );
    expect(() => Map().updateIn('abc' as any, (x) => x)).toThrow(
      'Invalid keyPath: expected Ordered Collection or Array: abc'
    );
  });

  it('deep edit throws if non-editable path', () => {
    const deep = Map({ key: Set([List(['item'])]) });
    expect(() => deep.updateIn(['key', 'foo', 'item'], () => 'newval')).toThrow(
      'Cannot update immutable value without .set() method: Set { List [ "item" ] }'
    );

    const deepSeq = Map({ key: Seq([List(['item'])]) });
    expect(() =>
      deepSeq.updateIn(['key', 'foo', 'item'], () => 'newval')
    ).toThrow(
      'Cannot update immutable value without .set() method: Seq [ List [ "item" ] ]'
    );

    const nonObj = Map({ key: 123 });
    expect(() => nonObj.updateIn(['key', 'foo'], () => 'newval')).toThrow(
      'Cannot update within non-data-structure value in path ["key"]: 123'
    );
  });

  it('identity with notSetValue is still identity', () => {
    const m = Map({ a: { b: { c: 10 } } });
    expect(m.updateIn(['x'], 100, (id) => id)).toEqual(m);
  });

  it('shallow remove', () => {
    const m = Map({ a: 123 });
    expect(m.updateIn([], (map) => undefined)).toEqual(undefined);
  });

  it('deep remove', () => {
    const m = fromJS({ a: { b: { c: 10 } } });
    expect(m.updateIn(['a', 'b'], (map) => map.remove('c')).toJS()).toEqual({
      a: { b: {} },
    });
  });

  it('deep set', () => {
    const m = fromJS({ a: { b: { c: 10 } } });
    expect(m.updateIn(['a', 'b'], (map) => map.set('d', 20)).toJS()).toEqual({
      a: { b: { c: 10, d: 20 } },
    });
  });

  it('deep push', () => {
    const m = fromJS({ a: { b: [1, 2, 3] } });
    expect(m.updateIn(['a', 'b'], (list) => list.push(4)).toJS()).toEqual({
      a: { b: [1, 2, 3, 4] },
    });
  });

  it('deep map', () => {
    const m = fromJS({ a: { b: [1, 2, 3] } });
    expect(
      m.updateIn(['a', 'b'], (list) => list.map((value) => value * 10)).toJS()
    ).toEqual({ a: { b: [10, 20, 30] } });
  });

  it('creates new maps if path contains gaps', () => {
    const m = fromJS({ a: { b: { c: 10 } } });
    expect(
      m.updateIn(['a', 'q', 'z'], Map(), (map) => map.set('d', 20)).toJS()
    ).toEqual({ a: { b: { c: 10 }, q: { z: { d: 20 } } } });
  });

  it('creates new objects if path contains gaps within raw JS', () => {
    const m = { a: { b: { c: 10 } } };
    expect(
      updateIn(m, ['a', 'b', 'z'], Map(), (map) => map.set('d', 20))
    ).toEqual({ a: { b: { c: 10, z: Map({ d: 20 }) } } });
  });

  it('throws if path cannot be set', () => {
    const m = fromJS({ a: { b: { c: 10 } } });
    expect(() => {
      m.updateIn(['a', 'b', 'c', 'd'], (v) => 20).toJS();
    }).toThrow();
  });

  it('update with notSetValue when non-existing key', () => {
    const m = Map({ a: { b: { c: 10 } } });
    expect(m.updateIn(['x'], 100, (map) => map + 1).toJS()).toEqual({
      a: { b: { c: 10 } },
      x: 101,
    });
  });

  it('update with notSetValue when non-existing key in raw JS', () => {
    const m = { a: { b: { c: 10 } } };
    expect(updateIn(m, ['x'], 100, (map) => map + 1)).toEqual({
      a: { b: { c: 10 } },
      x: 101,
    });
  });

  it('updates self for empty path', () => {
    const m = fromJS({ a: 1, b: 2, c: 3 });
    expect(m.updateIn([], (map) => map.set('b', 20)).toJS()).toEqual({
      a: 1,
      b: 20,
      c: 3,
    });
  });

  it('does not perform edit when new value is the same as old value', () => {
    const m = fromJS({ a: { b: { c: 10 } } });
    const m2 = m.updateIn(['a', 'b', 'c'], (id) => id);
    expect(m2).toBe(m);
  });

  it('does not perform edit when new value is the same as old value in raw JS', () => {
    const m = { a: { b: { c: 10 } } };
    const m2 = updateIn(m, ['a', 'b', 'c'], (id) => id);
    expect(m2).toBe(m);
  });

  it('does not perform edit when notSetValue is what you return from updater', () => {
    const m = Map();
    let spiedOnID;
    const m2 = m.updateIn(['a', 'b', 'c'], Set(), (id) => (spiedOnID = id));
    expect(m2).toBe(m);
    expect(spiedOnID).toBe(Set());
  });

  it('provides default notSetValue of undefined', () => {
    const m = Map();
    let spiedOnID;
    const m2 = m.updateIn(['a', 'b', 'c'], (id) => (spiedOnID = id));
    expect(m2).toBe(m);
    expect(spiedOnID).toBe(undefined);
  });

  describe('setIn', () => {
    it('provides shorthand for updateIn to set a single value', () => {
      const m = Map().setIn(['a', 'b', 'c'], 'X');
      expect(m).toEqual(fromJS({ a: { b: { c: 'X' } } }));
    });

    it('accepts a list as a keyPath', () => {
      const m = Map().setIn(fromJS(['a', 'b', 'c']), 'X');
      expect(m).toEqual(fromJS({ a: { b: { c: 'X' } } }));
    });

    it('returns value when setting empty path', () => {
      const m = Map();
      expect(m.setIn([], 'X')).toBe('X');
    });

    it('can setIn undefined', () => {
      const m = Map().setIn(['a', 'b', 'c'], undefined);
      expect(m).toEqual(Map({ a: Map({ b: Map({ c: undefined }) }) }));
    });

    it('returns self for a no-op', () => {
      const m = fromJS({ a: { b: { c: 123 } } });
      expect(m.setIn(['a', 'b', 'c'], 123)).toBe(m);
    });

    it('provides shorthand for updateIn to set a single value in raw JS', () => {
      const m = setIn({}, ['a', 'b', 'c'], 'X');
      expect(m).toEqual({ a: { b: { c: 'X' } } });
    });

    it('accepts a list as a keyPath in raw JS', () => {
      const m = setIn({}, fromJS(['a', 'b', 'c']), 'X');
      expect(m).toEqual({ a: { b: { c: 'X' } } });
    });

    it('returns value when setting empty path in raw JS', () => {
      expect(setIn({}, [], 'X')).toBe('X');
    });

    it('can setIn undefined in raw JS', () => {
      const m = setIn({}, ['a', 'b', 'c'], undefined);
      expect(m).toEqual({ a: { b: { c: undefined } } });
    });

    it('returns self for a no-op in raw JS', () => {
      const m = { a: { b: { c: 123 } } };
      expect(setIn(m, ['a', 'b', 'c'], 123)).toBe(m);
    });
  });

  describe('removeIn', () => {
    it('provides shorthand for updateIn to remove a single value', () => {
      const m = fromJS({ a: { b: { c: 'X', d: 'Y' } } });
      expect(m.removeIn(['a', 'b', 'c']).toJS()).toEqual({
        a: { b: { d: 'Y' } },
      });
    });

    it('accepts a list as a keyPath', () => {
      const m = fromJS({ a: { b: { c: 'X', d: 'Y' } } });
      expect(m.removeIn(fromJS(['a', 'b', 'c'])).toJS()).toEqual({
        a: { b: { d: 'Y' } },
      });
    });

    it('does not create empty maps for an unset path', () => {
      const m = Map();
      expect(m.removeIn(['a', 'b', 'c']).toJS()).toEqual({});
    });

    it('removes itself when removing empty path', () => {
      const m = Map();
      expect(m.removeIn([])).toBe(undefined);
    });

    it('removes values from a Set', () => {
      const m = Map({ set: Set([1, 2, 3]) });
      const m2 = m.removeIn(['set', 2]);
      expect(m2.toJS()).toEqual({ set: [1, 3] });
    });

    it('returns undefined when removing an empty path in raw JS', () => {
      expect(removeIn({}, [])).toBe(undefined);
    });

    it('can removeIn in raw JS', () => {
      const m = removeIn({ a: { b: { c: 123 } } }, ['a', 'b', 'c']);
      expect(m).toEqual({ a: { b: { c: undefined } } });
    });

    it('returns self for a no-op in raw JS', () => {
      const m = { a: { b: { c: 123 } } };
      expect(removeIn(m, ['a', 'b', 'd'])).toBe(m);
    });
  });

  describe('mergeIn', () => {
    it('provides shorthand for updateIn to merge a nested value', () => {
      const m1 = fromJS({ x: { a: 1, b: 2, c: 3 } });
      const m2 = fromJS({ d: 10, b: 20, e: 30 });
      expect(m1.mergeIn(['x'], m2).toJS()).toEqual({
        x: { a: 1, b: 20, c: 3, d: 10, e: 30 },
      });
    });

    it('accepts a list as a keyPath', () => {
      const m1 = fromJS({ x: { a: 1, b: 2, c: 3 } });
      const m2 = fromJS({ d: 10, b: 20, e: 30 });
      expect(m1.mergeIn(fromJS(['x']), m2).toJS()).toEqual({
        x: { a: 1, b: 20, c: 3, d: 10, e: 30 },
      });
    });

    it('does not create empty maps for a no-op merge', () => {
      const m = Map();
      expect(m.mergeIn(['a', 'b', 'c'], Map()).toJS()).toEqual({});
    });

    it('merges into itself for empty path', () => {
      const m = Map({ a: 1, b: 2, c: 3 });
      expect(m.mergeIn([], Map({ d: 10, b: 20, e: 30 })).toJS()).toEqual({
        a: 1,
        b: 20,
        c: 3,
        d: 10,
        e: 30,
      });
    });

    it('merges into plain JS Object and Array', () => {
      const m = Map({ a: { x: [1, 2, 3] } });
      expect(m.mergeIn(['a', 'x'], [4, 5, 6])).toEqual(
        Map({ a: { x: [1, 2, 3, 4, 5, 6] } })
      );
    });
  });

  describe('mergeDeepIn', () => {
    it('provides shorthand for updateIn to merge a nested value', () => {
      const m1 = fromJS({ x: { a: 1, b: 2, c: 3 } });
      const m2 = fromJS({ d: 10, b: 20, e: 30 });
      expect(m1.mergeDeepIn(['x'], m2).toJS()).toEqual({
        x: { a: 1, b: 20, c: 3, d: 10, e: 30 },
      });
    });

    it('accepts a list as a keyPath', () => {
      const m1 = fromJS({ x: { a: 1, b: 2, c: 3 } });
      const m2 = fromJS({ d: 10, b: 20, e: 30 });
      expect(m1.mergeDeepIn(fromJS(['x']), m2).toJS()).toEqual({
        x: { a: 1, b: 20, c: 3, d: 10, e: 30 },
      });
    });

    it('does not create empty maps for a no-op merge', () => {
      const m = Map();
      expect(m.mergeDeepIn(['a', 'b', 'c'], Map()).toJS()).toEqual({});
    });

    it('merges into itself for empty path', () => {
      const m = Map({ a: 1, b: 2, c: 3 });
      expect(m.mergeDeepIn([], Map({ d: 10, b: 20, e: 30 })).toJS()).toEqual({
        a: 1,
        b: 20,
        c: 3,
        d: 10,
        e: 30,
      });
    });

    it('merges deep into plain JS Object and Array', () => {
      const m = Map({ a: { x: [1, 2, 3] } });
      expect(m.mergeDeepIn(['a'], { x: [4, 5, 6] })).toEqual(
        Map({ a: { x: [1, 2, 3, 4, 5, 6] } })
      );
    });
  });
});
