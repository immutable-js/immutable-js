/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

import { OrderedMap, Range, Seq } from 'immutable';

describe('OrderedMap', () => {
  it('converts from object', () => {
    const m = OrderedMap({ c: 'C', b: 'B', a: 'A' });
    expect(m.get('a')).toBe('A');
    expect(m.get('b')).toBe('B');
    expect(m.get('c')).toBe('C');
    expect(m.toArray()).toEqual([
      ['c', 'C'],
      ['b', 'B'],
      ['a', 'A'],
    ]);
  });

  it('constructor provides initial values', () => {
    const m = OrderedMap({ a: 'A', b: 'B', c: 'C' });
    expect(m.get('a')).toBe('A');
    expect(m.get('b')).toBe('B');
    expect(m.get('c')).toBe('C');
    expect(m.size).toBe(3);
    expect(m.toArray()).toEqual([
      ['a', 'A'],
      ['b', 'B'],
      ['c', 'C'],
    ]);
  });

  it('provides initial values in a mixed order', () => {
    const m = OrderedMap({ c: 'C', b: 'B', a: 'A' });
    expect(m.get('a')).toBe('A');
    expect(m.get('b')).toBe('B');
    expect(m.get('c')).toBe('C');
    expect(m.size).toBe(3);
    expect(m.toArray()).toEqual([
      ['c', 'C'],
      ['b', 'B'],
      ['a', 'A'],
    ]);
  });

  it('constructor accepts sequences', () => {
    const s = Seq({ c: 'C', b: 'B', a: 'A' });
    const m = OrderedMap(s);
    expect(m.get('a')).toBe('A');
    expect(m.get('b')).toBe('B');
    expect(m.get('c')).toBe('C');
    expect(m.size).toBe(3);
    expect(m.toArray()).toEqual([
      ['c', 'C'],
      ['b', 'B'],
      ['a', 'A'],
    ]);
  });

  it('maintains order when new keys are set', () => {
    const m = OrderedMap()
      .set('A', 'aardvark')
      .set('Z', 'zebra')
      .set('A', 'antelope');
    expect(m.size).toBe(2);
    expect(m.toArray()).toEqual([
      ['A', 'antelope'],
      ['Z', 'zebra'],
    ]);
  });

  it('resets order when a keys is deleted', () => {
    const m = OrderedMap()
      .set('A', 'aardvark')
      .set('Z', 'zebra')
      .remove('A')
      .set('A', 'antelope');
    expect(m.size).toBe(2);
    expect(m.toArray()).toEqual([
      ['Z', 'zebra'],
      ['A', 'antelope'],
    ]);
  });

  it('removes correctly', () => {
    const m = OrderedMap({
      A: 'aardvark',
      Z: 'zebra',
    }).remove('A');
    expect(m.size).toBe(1);
    expect(m.get('A')).toBe(undefined);
    expect(m.get('Z')).toBe('zebra');
  });

  it('respects order for equality', () => {
    const m1 = OrderedMap().set('A', 'aardvark').set('Z', 'zebra');
    const m2 = OrderedMap().set('Z', 'zebra').set('A', 'aardvark');
    expect(m1.equals(m2)).toBe(false);
    expect(m1.equals(m2.reverse())).toBe(true);
  });

  it('respects order when merging', () => {
    const m1 = OrderedMap({ A: 'apple', B: 'banana', C: 'coconut' });
    const m2 = OrderedMap({ C: 'chocolate', B: 'butter', D: 'donut' });
    expect(m1.merge(m2).entrySeq().toArray()).toEqual([
      ['A', 'apple'],
      ['B', 'butter'],
      ['C', 'chocolate'],
      ['D', 'donut'],
    ]);
    expect(m2.merge(m1).entrySeq().toArray()).toEqual([
      ['C', 'coconut'],
      ['B', 'banana'],
      ['D', 'donut'],
      ['A', 'apple'],
    ]);
  });

  it('performs deleteAll correctly after resizing internal list', () => {
    // See condition for resizing internal list here:
    // https://github.com/immutable-js/immutable-js/blob/91c7c1e82ec616804768f968cc585565e855c8fd/src/OrderedMap.js#L138

    // Create OrderedMap greater than or equal to SIZE (currently 32)
    const SIZE = 32;
    let map = OrderedMap(Range(0, SIZE).map((key) => [key, 0]));

    // Delete half of the keys so that internal list is twice the size of internal map
    const keysToDelete = Range(0, SIZE / 2);
    map = map.deleteAll(keysToDelete);

    // Delete one more key to trigger resizing
    map = map.deleteAll([SIZE / 2]);

    expect(map.size).toBe(SIZE / 2 - 1);
  });
});
