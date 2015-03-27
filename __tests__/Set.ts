///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

jest.autoMockOff();

import Immutable = require('immutable');
import Set = Immutable.Set;

declare function expect(val: any): ExpectWithIs;

interface ExpectWithIs extends Expect {
  is(expected: any): void;
  not: ExpectWithIs;
}

describe('Set', () => {

  beforeEach(function () {
    this.addMatchers({
      is: function(expected) {
        return Immutable.is(this.actual, expected);
      }
    })
  })

  it('accepts array of values', () => {
    var s = Set([1,2,3]);
    expect(s.has(1)).toBe(true);
    expect(s.has(2)).toBe(true);
    expect(s.has(3)).toBe(true);
    expect(s.has(4)).toBe(false);
  });

  it('accepts array-like of values', () => {
    var s = Set({ 'length': 3, '1': 2 });
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
    var seq = Immutable.Seq.of(1,2,3);
    var s = Set(seq);
    expect(s.has(1)).toBe(true);
    expect(s.has(2)).toBe(true);
    expect(s.has(3)).toBe(true);
    expect(s.has(4)).toBe(false);
  });

  it('accepts a keyed Seq as a set of entries', () => {
    var seq = Immutable.Seq({a:null, b:null, c:null}).flip();
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
    var seq = Immutable.Seq({a:null, b:null, c:null});
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
    expect(Immutable.is(s1, s2)).toBe(true);
    expect(s1.equals(s2)).toBe(true);

    // Map and Set are not the same (keyed vs unkeyed)
    var v1 = Immutable.Map({ A: 'A', C: 'C', B: 'B' });
    expect(Immutable.is(s1, v1)).toBe(false);
  });

  it('can use union in a withMutation', () => {
    var js = Immutable.Set().withMutations(set => {
      set.union([ 'a' ]);
      set.add('b');
    }).toJS();
    expect(js).toEqual(['a', 'b']);
  });

  // TODO: more tests

});
