///<reference path='../resources/jest.d.ts'/>

declare var Symbol: any;
import { List, Map, OrderedSet, Seq, Set, is } from '../';

declare function expect(val: any): ExpectWithIs;

interface ExpectWithIs extends Expect {
  is(expected: any): void;
  not: ExpectWithIs;
}

jasmine.addMatchers({
  is: function() {
    return {
      compare: function(actual, expected) {
        var passed = is(actual, expected);
        return {
          pass: passed,
          message: 'Expected ' + actual + (passed ? '' : ' not') + ' to equal ' + expected
        };
      }
    };
  }
});

describe('Set', () => {
  it('accepts array of values', () => {
    var s = Set([1,2,3]);
    expect(s.has(1)).toBe(true);
    expect(s.has(2)).toBe(true);
    expect(s.has(3)).toBe(true);
    expect(s.has(4)).toBe(false);
  });

  it('accepts array-like of values', () => {
    var s = Set({ 'length': 3, '1': 2 } as any);
    expect(s.size).toBe(2)
    expect(s.has(undefined)).toBe(true);
    expect(s.has(2)).toBe(true);
    expect(s.has(1)).toBe(false);
  });

  it('accepts string, an array-like iterable', () => {
    var s = Set('abc');
    expect(s.size).toBe(3)
    expect(s.has('a')).toBe(true);
    expect(s.has('b')).toBe(true);
    expect(s.has('c')).toBe(true);
    expect(s.has('abc')).toBe(false);
  });

  it('accepts sequence of values', () => {
    var seq = Seq.of(1,2,3);
    var s = Set(seq);
    expect(s.has(1)).toBe(true);
    expect(s.has(2)).toBe(true);
    expect(s.has(3)).toBe(true);
    expect(s.has(4)).toBe(false);
  });

  it('accepts a keyed Seq as a set of entries', () => {
    var seq = Seq({a:null, b:null, c:null}).flip();
    var s = Set(seq);
    expect(s.toArray()).toEqual([[null,'a'], [null,'b'], [null,'c']]);
    // Explicitly getting the values sequence
    var s2 = Set(seq.valueSeq());
    expect(s2.toArray()).toEqual(['a','b','c']);
    // toSet() does this for you.
    var v3 = seq.toSet();
    expect(v3.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('accepts object keys', () => {
    var s = Set.fromKeys({a:null, b:null, c:null});
    expect(s.has('a')).toBe(true);
    expect(s.has('b')).toBe(true);
    expect(s.has('c')).toBe(true);
    expect(s.has('d')).toBe(false);
  });

  it('accepts sequence keys', () => {
    var seq = Seq({a:null, b:null, c:null});
    var s = Set.fromKeys(seq);
    expect(s.has('a')).toBe(true);
    expect(s.has('b')).toBe(true);
    expect(s.has('c')).toBe(true);
    expect(s.has('d')).toBe(false);
  });

  it('accepts explicit values', () => {
    var s = Set.of(1,2,3);
    expect(s.has(1)).toBe(true);
    expect(s.has(2)).toBe(true);
    expect(s.has(3)).toBe(true);
    expect(s.has(4)).toBe(false);
  });

  it('converts back to JS array', () => {
    var s = Set.of(1,2,3);
    expect(s.toArray()).toEqual([1,2,3]);
  });

  it('converts back to JS object', () => {
    var s = Set.of('a','b','c');
    expect(s.toObject()).toEqual({a:'a',b:'b',c:'c'});
  });

  it('iterates values', () => {
    var s = Set.of(1,2,3);
    var iterator = jest.genMockFunction();
    s.forEach(iterator);
    expect(iterator.mock.calls).toEqual([
      [1, 1, s],
      [2, 2, s],
      [3, 3, s]
    ]);
  });

  it('unions two sets', () => {
    var s1 = Set.of('a', 'b', 'c');
    var s2 = Set.of('d', 'b', 'wow');
    var s3 = s1.union(s2);
    expect(s3.toArray()).toEqual(['a', 'b', 'c', 'd', 'wow']);
  });

  it('returns self when union results in no-op', () => {
    var s1 = Set.of('a', 'b', 'c');
    var s2 = Set.of('c', 'a');
    var s3 = s1.union(s2);
    expect(s3).toBe(s1);
  });

  it('returns arg when union results in no-op', () => {
    var s1 = Set();
    var s2 = Set.of('a', 'b', 'c');
    var s3 = s1.union(s2);
    expect(s3).toBe(s2);
  });

  it('unions a set and an iterable and returns a set', () => {
    var s1 = Set([1,2,3]);
    var emptySet = Set();
    var l = List([1,2,3]);
    var s2 = s1.union(l);
    var s3 = emptySet.union(l);
    var o = OrderedSet([1,2,3]);
    var s4 = s1.union(o);
    var s5 = emptySet.union(o);
    expect(Set.isSet(s2)).toBe(true);
    expect(Set.isSet(s3)).toBe(true);
    expect(Set.isSet(s4) && !OrderedSet.isOrderedSet(s4)).toBe(true);
    expect(Set.isSet(s5) && !OrderedSet.isOrderedSet(s5)).toBe(true);
  });

  it('is persistent to adds', () => {
    var s1 = Set();
    var s2 = s1.add('a');
    var s3 = s2.add('b');
    var s4 = s3.add('c');
    var s5 = s4.add('b');
    expect(s1.size).toBe(0);
    expect(s2.size).toBe(1);
    expect(s3.size).toBe(2);
    expect(s4.size).toBe(3);
    expect(s5.size).toBe(3);
  });

  it('is persistent to deletes', () => {
    var s1 = Set();
    var s2 = s1.add('a');
    var s3 = s2.add('b');
    var s4 = s3.add('c');
    var s5 = s4.remove('b');
    expect(s1.size).toBe(0);
    expect(s2.size).toBe(1);
    expect(s3.size).toBe(2);
    expect(s4.size).toBe(3);
    expect(s5.size).toBe(2);
    expect(s3.has('b')).toBe(true);
    expect(s5.has('b')).toBe(false);
  });

  it('deletes down to empty set', () => {
    var s = Set.of('A').remove('A');
    expect(s).toBe(Set());
  });

  it('unions multiple sets', () => {
    var s = Set.of('A', 'B', 'C').union(Set.of('C', 'D', 'E'), Set.of('D', 'B', 'F'));
    expect(s).is(Set.of('A','B','C','D','E','F'));
  });

  it('intersects multiple sets', () => {
    var s = Set.of('A', 'B', 'C').intersect(Set.of('B', 'C', 'D'), Set.of('A', 'C', 'E'));
    expect(s).is(Set.of('C'));
  });

  it('diffs multiple sets', () => {
    var s = Set.of('A', 'B', 'C').subtract(Set.of('C', 'D', 'E'), Set.of('D', 'B', 'F'));
    expect(s).is(Set.of('A'));
  });

  it('expresses value equality with set sequences', () => {
    var s1 = Set.of('A', 'B', 'C');
    expect(s1.equals(null)).toBe(false);

    var s2 = Set.of('C', 'B', 'A');
    expect(s1 === s2).toBe(false);
    expect(is(s1, s2)).toBe(true);
    expect(s1.equals(s2)).toBe(true);

    // Map and Set are not the same (keyed vs unkeyed)
    var v1 = Map({ A: 'A', C: 'C', B: 'B' });
    expect(is(s1, v1)).toBe(false);
  });

  it('can use union in a withMutation', () => {
    var js = Set().withMutations(set => {
      set.union([ 'a' ]);
      set.add('b');
    }).toJS();
    expect(js).toEqual(['a', 'b']);
  });

  it('can determine if an array is a subset', () => {
    var s = Set.of('A', 'B', 'C');
    expect(s.isSuperset(['B', 'C'])).toBe(true);
    expect(s.isSuperset(['B', 'C', 'D'])).toBe(false);
  });

  describe('accepts Symbol as entry #579', () => {
    if (typeof Symbol !== 'function') {
      Symbol = function(key) {
        return { key: key, __proto__: Symbol };
      };
      Symbol.toString = function() {
        return 'Symbol(' + (this.key || '') + ')';
      }
    }

    it('operates on small number of symbols, preserving set uniqueness', () => {
      var a = Symbol();
      var b = Symbol();
      var c = Symbol();

      var symbolSet = Set([ a, b, c, a, b, c, a, b, c, a, b, c ]);
      expect(symbolSet.size).toBe(3);
      expect(symbolSet.has(b)).toBe(true);
      expect(symbolSet.get(c)).toEqual(c);
    });

    it('operates on a large number of symbols, maintaining obj uniqueness', () => {
      var manySymbols = [
        Symbol('a'), Symbol('b'), Symbol('c'),
        Symbol('a'), Symbol('b'), Symbol('c'),
        Symbol('a'), Symbol('b'), Symbol('c'),
        Symbol('a'), Symbol('b'), Symbol('c'),
      ];

      var symbolSet = Set(manySymbols);
      expect(symbolSet.size).toBe(12);
      expect(symbolSet.has(manySymbols[10])).toBe(true);
      expect(symbolSet.get(manySymbols[10])).toEqual(manySymbols[10]);
    });

  });

  it('can use intersect after add or union in a withMutation', () => {
    var set = Set(['a', 'd']).withMutations(set => {
      set.add('b');
      set.union(['c']);
      set.intersect(['b', 'c', 'd']);
    });
    expect(set.toArray()).toEqual(['c', 'd', 'b']);
  });

});
