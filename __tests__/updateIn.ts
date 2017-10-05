/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

import { fromJS, List, Map, Set } from '../';

describe('updateIn', () => {

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

  it('deep get throws if non-readable path', () => {
    const realWarn = console.warn;
    const warnings: Array<any> = [];
    console.warn = w => warnings.push(w);

    try {
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
    } finally {
      console.warn = realWarn;
    }
  });

  it('deep has throws without list or array-like', () => {
    // need to cast these as TypeScript first prevents us from such clownery.
    expect(() =>
      Map().hasIn(undefined as any),
    ).toThrow('Invalid keyPath: expected Ordered Collection or Array: undefined');
    expect(() =>
      Map().hasIn({ a: 1, b: 2 } as any),
    ).toThrow('Invalid keyPath: expected Ordered Collection or Array: [object Object]');
    expect(() =>
      Map().hasIn('abc' as any),
    ).toThrow('Invalid keyPath: expected Ordered Collection or Array: abc');
  });

  it('deep get returns not found if path does not match', () => {
    const m = fromJS({a: {b: {c: 10}}});
    expect(m.getIn(['a', 'b', 'z'])).toEqual(undefined);
  });

  it('deep edit', () => {
    const m = fromJS({a: {b: {c: 10}}});
    expect(
      m.updateIn(['a', 'b', 'c'], value => value * 2).toJS(),
    ).toEqual(
      {a: {b: {c: 20}}},
    );
  });

  it('deep edit with list as keyPath', () => {
    const m = fromJS({a: {b: {c: 10}}});
    expect(
      m.updateIn(fromJS(['a', 'b', 'c']), value => value * 2).toJS(),
    ).toEqual(
      {a: {b: {c: 20}}},
    );
  });

  it('deep edit throws without list or array-like', () => {
    // need to cast these as TypeScript first prevents us from such clownery.
    expect(() =>
      Map().updateIn(undefined as any, x => x),
    ).toThrow('Invalid keyPath: expected Ordered Collection or Array: undefined');
    expect(() =>
      Map().updateIn({ a: 1, b: 2 } as any, x => x),
    ).toThrow('Invalid keyPath: expected Ordered Collection or Array: [object Object]');
    expect(() =>
      Map().updateIn('abc' as any, x => x),
    ).toThrow('Invalid keyPath: expected Ordered Collection or Array: abc');
  });

  it('deep edit throws if non-editable path', () => {
    const deep = Map({ key: Set([ List([ "item" ]) ]) });
    expect(() =>
      deep.updateIn(["key", "foo", "item"], x => x),
    ).toThrow(
      'Invalid keyPath: Value at ["key"] does not have a .set() method ' +
      'and cannot be updated: Set { List [ "item" ] }',
    );
  });

  it('identity with notSetValue is still identity', () => {
    const m = Map({a: {b: {c: 10}}});
    expect(
      m.updateIn(['x'], 100, id => id),
    ).toEqual(
      m,
    );
  });

  it('shallow remove', () => {
    const m = Map({a: 123});
    expect(
      m.updateIn([], map => undefined),
    ).toEqual(
      undefined,
    );
  });

  it('deep remove', () => {
    const m = fromJS({a: {b: {c: 10}}});
    expect(
      m.updateIn(['a', 'b'], map => map.remove('c')).toJS(),
    ).toEqual(
      {a: {b: {}}},
    );
  });

  it('deep set', () => {
    const m = fromJS({a: {b: {c: 10}}});
    expect(
      m.updateIn(['a', 'b'], map => map.set('d', 20)).toJS(),
    ).toEqual(
      {a: {b: {c: 10, d: 20}}},
    );
  });

  it('deep push', () => {
    const m = fromJS({a: {b: [1, 2, 3]}});
    expect(
      m.updateIn(['a', 'b'], list => list.push(4)).toJS(),
    ).toEqual(
      {a: {b: [1, 2, 3, 4]}},
    );
  });

  it('deep map', () => {
    const m = fromJS({a: {b: [1, 2, 3]}});
    expect(
      m.updateIn(['a', 'b'], list => list.map(value => value * 10)).toJS(),
    ).toEqual(
      {a: {b: [10, 20, 30]}},
    );
  });

  it('creates new maps if path contains gaps', () => {
    const m = fromJS({a: {b: {c: 10}}});
    expect(
      m.updateIn(['a', 'q', 'z'], Map(), map => map.set('d', 20)).toJS(),
    ).toEqual(
      {a: {b: {c: 10}, q: {z: {d: 20}}}},
    );
  });

  it('throws if path cannot be set', () => {
    const m = fromJS({a: {b: {c: 10}}});
    expect(() => {
      m.updateIn(['a', 'b', 'c', 'd'], v => 20).toJS();
    }).toThrow();
  });

  it('update with notSetValue when non-existing key', () => {
    const m = Map({a: {b: {c: 10}}});
    expect(
      m.updateIn(['x'], 100, map => map + 1).toJS(),
    ).toEqual(
      {a: {b: {c: 10}}, x: 101},
    );
  });

  it('updates self for empty path', () => {
    const m = fromJS({a: 1, b: 2, c: 3});
    expect(
      m.updateIn([], map => map.set('b', 20)).toJS(),
    ).toEqual(
      {a: 1, b: 20, c: 3},
    );
  });

  it('does not perform edit when new value is the same as old value', () => {
    const m = fromJS({a: {b: {c: 10}}});
    const m2 = m.updateIn(['a', 'b', 'c'], id => id);
    expect(m2).toBe(m);
  });

  it('does not perform edit when notSetValue is what you return from updater', () => {
    const m = Map();
    let spiedOnID;
    const m2 = m.updateIn(['a', 'b', 'c'], Set(), id => (spiedOnID = id));
    expect(m2).toBe(m);
    expect(spiedOnID).toBe(Set());
  });

  it('provides default notSetValue of undefined', () => {
    const m = Map();
    let spiedOnID;
    const m2 = m.updateIn(['a', 'b', 'c'], id => (spiedOnID = id));
    expect(m2).toBe(m);
    expect(spiedOnID).toBe(undefined);
  });

  describe('setIn', () => {

    it('provides shorthand for updateIn to set a single value', () => {
      const m = Map().setIn(['a', 'b', 'c'], 'X');
      expect(m.toJS()).toEqual({a: {b: {c: 'X'}}});
    });

    it('accepts a list as a keyPath', () => {
      const m = Map().setIn(fromJS(['a', 'b', 'c']), 'X');
      expect(m.toJS()).toEqual({a: {b: {c: 'X'}}});
    });

    it('returns value when setting empty path', () => {
      const m = Map();
      expect(m.setIn([], 'X')).toBe('X');
    });

    it('can setIn undefined', () => {
      const m = Map().setIn(['a', 'b', 'c'], undefined);
      expect(m.toJS()).toEqual({a: {b: {c: undefined}}});
    });

  });

  describe('removeIn', () => {

    it('provides shorthand for updateIn to remove a single value', () => {
      const m = fromJS({a: {b: {c: 'X', d: 'Y'}}});
      expect(m.removeIn(['a', 'b', 'c']).toJS()).toEqual({a: {b: {d: 'Y'}}});
    });

    it('accepts a list as a keyPath', () => {
      const m = fromJS({a: {b: {c: 'X', d: 'Y'}}});
      expect(m.removeIn(fromJS(['a', 'b', 'c'])).toJS()).toEqual({a: {b: {d: 'Y'}}});
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
      const m = Map({ set: Set([ 1, 2, 3 ]) });
      const m2 = m.removeIn([ 'set', 2 ]);
      expect(m2.toJS()).toEqual({ set: [ 1, 3 ] });
    });
  });

  describe('mergeIn', () => {

    it('provides shorthand for updateIn to merge a nested value', () => {
      const m1 = fromJS({x: {a: 1, b: 2, c: 3}});
      const m2 = fromJS({d: 10, b: 20, e: 30});
      expect(m1.mergeIn(['x'], m2).toJS()).toEqual(
        {x: {a: 1, b: 20, c: 3, d: 10, e: 30}},
      );
    });

    it('accepts a list as a keyPath', () => {
      const m1 = fromJS({x: {a: 1, b: 2, c: 3}});
      const m2 = fromJS({d: 10, b: 20, e: 30});
      expect(m1.mergeIn(fromJS(['x']), m2).toJS()).toEqual(
        {x: {a: 1, b: 20, c: 3, d: 10, e: 30}},
      );
    });

    it('does not create empty maps for a no-op merge', () => {
      const m = Map();
      expect(m.mergeIn(['a', 'b', 'c'], Map()).toJS()).toEqual({});
    });

    it('merges into itself for empty path', () => {
      const m = Map({a: 1, b: 2, c: 3});
      expect(
        m.mergeIn([], Map({d: 10, b: 20, e: 30})).toJS(),
      ).toEqual(
        {a: 1, b: 20, c: 3, d: 10, e: 30},
      );
    });

  });

  describe('mergeDeepIn', () => {

    it('provides shorthand for updateIn to merge a nested value', () => {
      const m1 = fromJS({x: {a: 1, b: 2, c: 3}});
      const m2 = fromJS({d: 10, b: 20, e: 30});
      expect(m1.mergeDeepIn(['x'], m2).toJS()).toEqual(
        {x: {a: 1, b: 20, c: 3, d: 10, e: 30}},
      );
    });

    it('accepts a list as a keyPath', () => {
      const m1 = fromJS({x: {a: 1, b: 2, c: 3}});
      const m2 = fromJS({d: 10, b: 20, e: 30});
      expect(m1.mergeDeepIn(fromJS(['x']), m2).toJS()).toEqual(
        {x: {a: 1, b: 20, c: 3, d: 10, e: 30}},
      );
    });

    it('does not create empty maps for a no-op merge', () => {
      const m = Map();
      expect(m.mergeDeepIn(['a', 'b', 'c'], Map()).toJS()).toEqual({});
    });

    it('merges into itself for empty path', () => {
      const m = Map({a: 1, b: 2, c: 3});
      expect(
        m.mergeDeepIn([], Map({d: 10, b: 20, e: 30})).toJS(),
      ).toEqual(
        {a: 1, b: 20, c: 3, d: 10, e: 30},
      );
    });

  });

});
