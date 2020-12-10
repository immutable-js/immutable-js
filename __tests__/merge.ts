/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

import {
  fromJS,
  is,
  List,
  Map,
  merge,
  mergeDeep,
  mergeDeepWith,
  Record,
  Set,
} from 'immutable';

describe('merge', () => {
  it('merges two maps', () => {
    const m1 = Map({ a: 1, b: 2, c: 3 });
    const m2 = Map({ d: 10, b: 20, e: 30 });
    expect(m1.merge(m2)).toEqual(Map({ a: 1, b: 20, c: 3, d: 10, e: 30 }));
  });

  it('can merge in an explicitly undefined value', () => {
    const m1 = Map({ a: 1, b: 2 });
    const m2 = Map({ a: undefined as any });
    expect(m1.merge(m2)).toEqual(Map({ a: undefined, b: 2 }));
  });

  it('merges two maps with a merge function', () => {
    const m1 = Map({ a: 1, b: 2, c: 3 });
    const m2 = Map({ d: 10, b: 20, e: 30 });
    expect(m1.mergeWith((a, b) => a + b, m2)).toEqual(
      Map({ a: 1, b: 22, c: 3, d: 10, e: 30 })
    );
  });

  it('throws typeError without merge function', () => {
    const m1 = Map({ a: 1, b: 2, c: 3 });
    const m2 = Map({ d: 10, b: 20, e: 30 });
    expect(() => m1.mergeWith(1, m2)).toThrowError(TypeError);
  });

  it('provides key as the third argument of merge function', () => {
    const m1 = Map({ id: 'temp', b: 2, c: 3 });
    const m2 = Map({ id: 10, b: 20, e: 30 });
    const add = (a, b) => a + b;
    expect(
      m1.mergeWith((a, b, key) => (key !== 'id' ? add(a, b) : b), m2)
    ).toEqual(Map({ id: 10, b: 22, c: 3, e: 30 }));
  });

  it('deep merges two maps', () => {
    const m1 = fromJS({ a: { b: { c: 1, d: 2 } } });
    const m2 = fromJS({ a: { b: { c: 10, e: 20 }, f: 30 }, g: 40 });
    expect(m1.mergeDeep(m2)).toEqual(
      fromJS({ a: { b: { c: 10, d: 2, e: 20 }, f: 30 }, g: 40 })
    );
  });

  it('merge uses === for return-self optimization', () => {
    const date1 = new Date(1234567890000);
    // Value equal, but different reference.
    const date2 = new Date(1234567890000);
    const m = Map().set('a', date1);
    expect(m.merge({ a: date2 })).not.toBe(m);
    expect(m.merge({ a: date1 })).toBe(m);
  });

  it('deep merge uses === for return-self optimization', () => {
    const date1 = new Date(1234567890000);
    // Value equal, but different reference.
    const date2 = new Date(1234567890000);
    const m = Map().setIn(['a', 'b', 'c'], date1);
    expect(m.mergeDeep({ a: { b: { c: date2 } } })).not.toBe(m);
    expect(m.mergeDeep({ a: { b: { c: date1 } } })).toBe(m);
  });

  it('deep merges raw JS', () => {
    const m1 = fromJS({ a: { b: { c: 1, d: 2 } } });
    const js = { a: { b: { c: 10, e: 20 }, f: 30 }, g: 40 };
    expect(m1.mergeDeep(js)).toEqual(
      fromJS({ a: { b: { c: 10, d: 2, e: 20 }, f: 30 }, g: 40 })
    );
  });

  it('deep merges raw JS with a merge function', () => {
    const m1 = fromJS({ a: { b: { c: 1, d: 2 } } });
    const js = { a: { b: { c: 10, e: 20 }, f: 30 }, g: 40 };
    expect(m1.mergeDeepWith((a, b) => a + b, js)).toEqual(
      fromJS({ a: { b: { c: 11, d: 2, e: 20 }, f: 30 }, g: 40 })
    );
  });

  it('deep merges raw JS into raw JS with a merge function', () => {
    const js1 = { a: { b: { c: 1, d: 2 } } };
    const js2 = { a: { b: { c: 10, e: 20 }, f: 30 }, g: 40 };
    expect(mergeDeepWith((a, b) => a + b, js1, js2)).toEqual({
      a: { b: { c: 11, d: 2, e: 20 }, f: 30 },
      g: 40,
    });
  });

  it('deep merges collections into raw JS with a merge function', () => {
    const js = { a: { b: { c: 1, d: 2 } } };
    const m = fromJS({ a: { b: { c: 10, e: 20 }, f: 30 }, g: 40 });
    expect(mergeDeepWith((a, b) => a + b, js, m)).toEqual({
      a: { b: { c: 11, d: 2, e: 20 }, f: 30 },
      g: 40,
    });
  });

  it('returns self when a deep merges is a no-op', () => {
    const m1 = fromJS({ a: { b: { c: 1, d: 2 } } });
    expect(m1.mergeDeep({ a: { b: { c: 1 } } })).toBe(m1);
  });

  it('returns arg when a deep merges is a no-op', () => {
    const m1 = fromJS({ a: { b: { c: 1, d: 2 } } });
    expect(Map().mergeDeep(m1)).toBe(m1);
  });

  it('returns self when a deep merges is a no-op on raw JS', () => {
    const m1 = { a: { b: { c: 1, d: 2 } } };
    expect(mergeDeep(m1, { a: { b: { c: 1 } } })).toBe(m1);
  });

  it('can overwrite existing maps', () => {
    expect(
      fromJS({ a: { x: 1, y: 1 }, b: { x: 2, y: 2 } }).merge({
        a: null,
        b: Map({ x: 10 }),
      })
    ).toEqual(fromJS({ a: null, b: { x: 10 } }));
    expect(
      fromJS({ a: { x: 1, y: 1 }, b: { x: 2, y: 2 } }).mergeDeep({
        a: null,
        b: { x: 10 },
      })
    ).toEqual(fromJS({ a: null, b: { x: 10, y: 2 } }));
  });

  it('can overwrite existing maps with objects', () => {
    const m1 = fromJS({ a: { x: 1, y: 1 } }); // deep conversion.
    const m2 = Map({ a: { z: 10 } }); // shallow conversion to Map.

    // Raw object simply replaces map.
    expect(m1.merge(m2).get('a')).toEqual({ z: 10 }); // raw object.
    // However, mergeDeep will merge that value into the inner Map.
    expect(m1.mergeDeep(m2).get('a')).toEqual(Map({ x: 1, y: 1, z: 10 }));
  });

  it('merges map entries with List and Set values', () => {
    const initial = Map({
      a: Map({ x: 10, y: 20 }),
      b: List([1, 2, 3]),
      c: Set([1, 2, 3]),
    });
    const additions = Map({
      a: Map({ y: 50, z: 100 }),
      b: List([4, 5, 6]),
      c: Set([4, 5, 6]),
    });
    expect(initial.mergeDeep(additions)).toEqual(
      Map({
        a: Map({ x: 10, y: 50, z: 100 }),
        b: List([1, 2, 3, 4, 5, 6]),
        c: Set([1, 2, 3, 4, 5, 6]),
      })
    );
  });

  it('merges map entries with new values', () => {
    const initial = Map({ a: List([1]) });

    // Note: merge and mergeDeep do not deeply coerce values, they only merge
    // with what's there prior.
    expect(initial.merge({ b: [2] } as any)).toEqual(
      Map({ a: List([1]), b: [2] })
    );
    expect(initial.mergeDeep({ b: [2] } as any)).toEqual(
      fromJS(Map({ a: List([1]), b: [2] }))
    );
  });

  it('maintains JS values inside immutable collections', () => {
    const m1 = fromJS({ a: { b: { imm: 'map' } } });
    const m2 = m1.mergeDeep(Map({ a: Map({ b: { plain: 'obj' } }) }));

    expect(m1.getIn(['a', 'b'])).toEqual(Map([['imm', 'map']]));
    // However mergeDeep will merge that value into the inner Map
    expect(m2.getIn(['a', 'b'])).toEqual(Map({ imm: 'map', plain: 'obj' }));
  });

  it('merges plain Objects', () => {
    expect(merge({ x: 1, y: 1 }, { y: 2, z: 2 }, Map({ z: 3, q: 3 }))).toEqual({
      x: 1,
      y: 2,
      z: 3,
      q: 3,
    });
  });

  it('merges plain Arrays', () => {
    expect(merge([1, 2], [3, 4], List([5, 6]))).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('merging plain Array returns self after no-op', () => {
    const a = [1, 2, 3];
    expect(merge(a, [], [])).toBe(a);
  });

  it('mergeDeep with tuple Symbol keys', () => {
    const a = Symbol('a');
    const b = Symbol('b');
    const c = Symbol('c');
    const d = Symbol('d');
    const e = Symbol('e');
    const f = Symbol('f');
    const g = Symbol('g');

    // Note the use of nested Map constructors, Map() does not do a deep conversion!
    const m1 = Map([
      [
        a,
        Map([
          [
            b,
            Map([
              [c, 1],
              [d, 2],
            ]),
          ],
        ]),
      ],
    ]);

    // mergeDeep can be directly given a nested set of `Iterable<[K, V]>`
    const merged = m1.mergeDeep([
      [
        a,
        [
          [
            b,
            [
              [c, 10],
              [e, 20],
              [f, 30],
              [g, 40],
            ],
          ],
        ],
      ],
    ]);

    expect(merged).toEqual(
      Map([
        [
          a,
          Map([
            [
              b,
              Map([
                [c, 10],
                [d, 2],
                [e, 20],
                [f, 30],
                [g, 40],
              ]),
            ],
          ]),
        ],
      ])
    );
  });

  it('merges records with a size property set to 0', () => {
    const Sizable = Record({ size: 0 });
    expect(Sizable().merge({ size: 123 }).size).toBe(123);
  });
});
