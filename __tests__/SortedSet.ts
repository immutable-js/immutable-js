/**
 *  Copyright (c) 2017, Applitopia, Inc.
 *
 *  Modified source code is licensed under the MIT-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

declare var Symbol: any;

import {
  is,
  List,
  Map,
  OrderedSet,
  Range,
  Seq,
  Set,
  SortedMap,
  SortedSet,
} from 'immutable';

describe('SortedSet', () => {
  it('accepts array of values', () => {
    const s = SortedSet([1, 2, 3]);
    expect(s.has(1)).toBe(true);
    expect(s.has(2)).toBe(true);
    expect(s.has(3)).toBe(true);
    expect(s.has(4)).toBe(false);
  });

  it('accepts array-like of values', () => {
    const s = SortedSet<any>({ length: 3, 2: 3 } as any);
    expect(s.size).toBe(2);
    expect(s.has(undefined)).toBe(true);
    expect(s.has(3)).toBe(true);
    expect(s.has(2)).toBe(false);
  });

  it('accepts string, an array-like collection', () => {
    const s = SortedSet('abc');
    expect(s.size).toBe(3);
    expect(s.has('a')).toBe(true);
    expect(s.has('b')).toBe(true);
    expect(s.has('c')).toBe(true);
    expect(s.has('abc')).toBe(false);
  });

  it('accepts sequence of values', () => {
    const seq = Seq([1, 2, 3]);
    const s = SortedSet(seq);
    expect(s.has(1)).toBe(true);
    expect(s.has(2)).toBe(true);
    expect(s.has(3)).toBe(true);
    expect(s.has(4)).toBe(false);
  });

  it('accepts a keyed Seq as a set of entries', () => {
    const seq = Seq({ a: null, b: null, c: null }).flip();
    const s = SortedSet(seq);
    expect(s.toArray()).toEqual([
      [null, 'a'],
      [null, 'b'],
      [null, 'c'],
    ]);
    // Explicitly getting the values sequence
    const s2 = SortedSet(seq.valueSeq());
    expect(s2.toArray()).toEqual(['a', 'b', 'c']);
    // toSet() does this for you.
    const v3 = seq.toSortedSet();
    expect(v3.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('accepts object keys', () => {
    const s = SortedSet.fromKeys({ a: null, b: null, c: null });
    expect(s.has('a')).toBe(true);
    expect(s.has('b')).toBe(true);
    expect(s.has('c')).toBe(true);
    expect(s.has('d')).toBe(false);
  });

  it('accepts sequence keys', () => {
    const seq = Seq({ a: null, b: null, c: null });
    const s = SortedSet.fromKeys(seq);
    expect(s.has('a')).toBe(true);
    expect(s.has('b')).toBe(true);
    expect(s.has('c')).toBe(true);
    expect(s.has('d')).toBe(false);
  });

  it('accepts explicit values', () => {
    const s = SortedSet.of(1, 2, 3);
    expect(s.has(1)).toBe(true);
    expect(s.has(2)).toBe(true);
    expect(s.has(3)).toBe(true);
    expect(s.has(4)).toBe(false);
  });

  it('converts back to JS array', () => {
    const s = SortedSet.of(1, 2, 3);
    expect(s.toArray()).toEqual([1, 2, 3]);
  });

  it('converts back to JS object', () => {
    const s = SortedSet.of('a', 'b', 'c');
    expect(s.toObject()).toEqual({ a: 'a', b: 'b', c: 'c' });
  });

  it('unions an unknown collection of SortedSets', () => {
    const abc = SortedSet(['a', 'b', 'c']);
    const cat = SortedSet(['c', 'a', 't']);
    expect(Set.union([abc, cat]).toArray()).toEqual(['a', 'c', 't', 'b']);
    expect(Set.union([abc])).toEqual(Set(['a', 'b', 'c']));
    expect(Set.union([])).toBe(Set());
  });

  it('intersects an unknown collection of SortedSets', () => {
    const abc = SortedSet(['a', 'b', 'c']);
    const cat = SortedSet(['c', 'a', 't']);
    expect(Set.intersect([abc, cat]).toArray()).toEqual(['a', 'c']);
  });

  it('iterates values', () => {
    const s = SortedSet.of(1, 2, 3);
    const iterator = jest.fn();
    s.forEach(iterator);
    expect(iterator.mock.calls).toEqual([
      [1, 1, s],
      [2, 2, s],
      [3, 3, s],
    ]);
  });

  it('unions two sets', () => {
    const s1 = SortedSet.of('a', 'b', 'c');
    const s2 = SortedSet.of('d', 'b', 'wow');
    const s3 = s1.union(s2);
    expect(s3.toArray()).toEqual(['a', 'b', 'c', 'd', 'wow']);
  });

  it('returns self when union results in no-op', () => {
    const s1 = SortedSet.of('a', 'b', 'c');
    const s2 = SortedSet.of('c', 'a');
    const s3 = s1.union(s2);
    expect(s3).toBe(s1);
  });

  it('returns arg when union results in no-op', () => {
    const s1 = SortedSet();
    const s2 = SortedSet.of('a', 'b', 'c');
    const s3 = s1.union(s2);
    expect(s3).toBe(s2);
  });

  it('unions a set and another collection and returns a set', () => {
    const s1 = SortedSet([1, 2, 3]);
    const emptySortedSet = SortedSet();
    const l = List([1, 2, 3]);
    const s2 = s1.union(l);
    const s3 = emptySortedSet.union(l);
    const o = OrderedSet([1, 2, 3]);
    const s4 = s1.union(o);
    const s5 = emptySortedSet.union(o);
    expect(Set.isSet(s2)).toBe(true);
    expect(Set.isSet(s3)).toBe(true);
    expect(Set.isSet(s4) && !OrderedSet.isOrderedSet(s4)).toBe(true);
    expect(Set.isSet(s5) && !OrderedSet.isOrderedSet(s5)).toBe(true);
  });

  it('is persistent to adds', () => {
    const s1 = SortedSet();
    const s2 = s1.add('a');
    const s3 = s2.add('b');
    const s4 = s3.add('c');
    const s5 = s4.add('b');
    expect(s1.size).toBe(0);
    expect(s2.size).toBe(1);
    expect(s3.size).toBe(2);
    expect(s4.size).toBe(3);
    expect(s5.size).toBe(3);
  });

  it('is persistent to deletes', () => {
    const s1 = SortedSet();
    const s2 = s1.add('a');
    const s3 = s2.add('b');
    const s4 = s3.add('c');
    const s5 = s4.remove('b');
    expect(s1.size).toBe(0);
    expect(s2.size).toBe(1);
    expect(s3.size).toBe(2);
    expect(s4.size).toBe(3);
    expect(s5.size).toBe(2);
    expect(s3.has('b')).toBe(true);
    expect(s5.has('b')).toBe(false);
  });

  it('deletes down to empty set', () => {
    const s = SortedSet.of('A').remove('A');
    expect(s).toEqual(SortedSet());
  });

  it('unions multiple sets', () => {
    const s = SortedSet.of('A', 'B', 'C').union(
      SortedSet.of('C', 'D', 'E'),
      SortedSet.of('D', 'B', 'F')
    );
    expect(is(s, SortedSet.of('A', 'B', 'C', 'D', 'E', 'F'))).toBeTruthy();
  });

  it('intersects multiple sets', () => {
    const s = SortedSet.of('A', 'B', 'C').intersect(
      SortedSet.of('B', 'C', 'D'),
      SortedSet.of('A', 'C', 'E')
    );
    expect(is(s, SortedSet.of('C'))).toBeTruthy();
  });

  it('diffs multiple sets', () => {
    const s = SortedSet.of('A', 'B', 'C').subtract(
      SortedSet.of('C', 'D', 'E'),
      SortedSet.of('D', 'B', 'F')
    );
    expect(is(s, SortedSet.of('A'))).toBeTruthy();
  });

  it('expresses value equality with set sequences', () => {
    const s1 = SortedSet.of('A', 'B', 'C');
    expect(s1.equals(null)).toBe(false);

    const s2 = SortedSet.of('C', 'B', 'A');
    expect(s1 === s2).toBe(false);
    expect(is(s1, s2)).toBe(true);
    expect(s1.equals(s2)).toBe(true);

    // SortedMap and SortedSet are not the same (keyed vs unkeyed)
    const v1 = SortedMap({ A: 'A', C: 'C', B: 'B' });
    expect(is(s1, v1)).toBe(false);
  });

  it('can use union in a withMutation', () => {
    const js = SortedSet()
      .withMutations(set => {
        set.union(['a']);
        set.add('b');
      })
      .toJS();
    expect(js).toEqual(['a', 'b']);
  });

  it('can determine if an array is a subset', () => {
    const s = SortedSet.of('A', 'B', 'C');
    expect(s.isSuperset(['B', 'C'])).toBe(true);
    expect(s.isSuperset(['B', 'C', 'D'])).toBe(false);
  });

  describe('accepts Symbol as entry #579', () => {
    if (typeof Symbol !== 'function') {
      Symbol = function (key) {
        return { key, __proto__: Symbol };
      };
      Symbol.toString = function () {
        return 'Symbol(' + (this.key || '') + ')';
      };
    }

    it('operates on small number of symbols, preserving set uniqueness', () => {
      const a = Symbol();
      const b = Symbol();
      const c = Symbol();

      const symbolSet = SortedSet([a, b, c, a, b, c, a, b, c, a, b, c]);
      expect(symbolSet.size).toBe(1);
      expect(symbolSet.has(b)).toBe(true);
      expect(symbolSet.get(c)).toEqual(c);
    });

    it('operates on a large number of symbols, maintaining obj uniqueness', () => {
      const manySymbols = [
        Symbol('a'),
        Symbol('b'),
        Symbol('c'),
        Symbol('a'),
        Symbol('b'),
        Symbol('c'),
        Symbol('a'),
        Symbol('b'),
        Symbol('c'),
        Symbol('a'),
        Symbol('b'),
        Symbol('c'),
      ];

      const symbolSet = SortedSet(manySymbols);
      expect(symbolSet.size).toBe(3);
      expect(symbolSet.has(manySymbols[10])).toBe(true);
      expect(symbolSet.get(manySymbols[10])).toEqual(manySymbols[10]);
    });
  });

  it('can use intersect after add or union in a withMutation', () => {
    const set = SortedSet(['a', 'd']).withMutations(s => {
      s.add('b');
      s.union(['c']);
      s.intersect(['b', 'c', 'd']);
    });
    expect(set.toArray()).toEqual(['b', 'c', 'd']);
  });

  it('can count entries that satisfy a predicate', () => {
    const set = SortedSet([1, 2, 3, 4, 5]);
    expect(set.size).toEqual(5);
    expect(set.count()).toEqual(5);
    expect(set.count(x => x % 2 === 0)).toEqual(2);
    expect(set.count(x => true)).toEqual(5);
  });

  it('works with the `new` operator #3', () => {
    const s = SortedSet([1, 2, 3]);
    expect(s.has(1)).toBe(true);
    expect(s.has(2)).toBe(true);
    expect(s.has(3)).toBe(true);
    expect(s.has(4)).toBe(false);
  });

  it('builds correct seq in function from', () => {
    const size = 10000;
    const data = Range(0, size);
    const s = SortedSet(data, undefined, { type: 'btree', btreeOrder: 3 });

    expect(s.toSeq().size).toBe(size);

    for (let n = 10; n < 100; n += 13) {
      for (let i = 0; i < size; i += 17) {
        const limit = i + n < size ? i + n : size;
        const seq = s.from(i).takeWhile(k => k < limit);
        const l1 = seq.toList();
        const l2 = Range(i, limit).toList();
        expect(is(l1, l2)).toEqual(true);
      }
    }
  });

  it('builds correct seq in function from backwards', () => {
    const size = 10000;
    const data = Range(0, size);
    const s = SortedSet(data, undefined, { type: 'btree', btreeOrder: 3 });

    expect(s.toSeq().size).toBe(size);

    for (let n = 10; n < 100; n += 13) {
      for (let i = 0; i < size; i += 17) {
        const limit = i + 1 >= n ? i + 1 - n : 0;
        const seq = s.from(i, true).takeWhile(k => k >= limit);
        const l1 = seq.toList();
        const l2 = Range(i, limit - 1, -1).toList();
        // tslint:disable-next-line:no-console
        // console.log(l1, l2);
        expect(is(l1, l2)).toEqual(true);
      }
    }
  });
});
