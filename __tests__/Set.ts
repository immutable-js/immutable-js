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

  it('converts from array of values', () => {
    var s = Set.from([1,2,3]);
    expect(s.has(1)).toBe(true);
    expect(s.has(2)).toBe(true);
    expect(s.has(3)).toBe(true);
    expect(s.has(4)).toBe(false);
  });

  it('converts from sequence of values', () => {
    var seq = Immutable.Sequence.of(1,2,3);
    var s = Set.from(seq);
    expect(s.has(1)).toBe(true);
    expect(s.has(2)).toBe(true);
    expect(s.has(3)).toBe(true);
    expect(s.has(4)).toBe(false);
  });

  it('converts from object keys', () => {
    var s = Set.fromKeys({a:null, b:null, c:null});
    expect(s.has('a')).toBe(true);
    expect(s.has('b')).toBe(true);
    expect(s.has('c')).toBe(true);
    expect(s.has('d')).toBe(false);
  });

  it('converts from sequence keys', () => {
    var seq = Immutable.Sequence({a:null, b:null, c:null});
    var s = Set.fromKeys(seq);
    expect(s.has('a')).toBe(true);
    expect(s.has('b')).toBe(true);
    expect(s.has('c')).toBe(true);
    expect(s.has('d')).toBe(false);
  });

  it('constructor provides initial values', () => {
    var s = Set(1,2,3);
    expect(s.has(1)).toBe(true);
    expect(s.has(2)).toBe(true);
    expect(s.has(3)).toBe(true);
    expect(s.has(4)).toBe(false);
  });

  it('converts back to JS array', () => {
    var s = Set(1,2,3);
    expect(s.toArray()).toEqual([1,2,3]);
  });

  it('converts back to JS object', () => {
    var s = Set('a','b','c');
    expect(s.toObject()).toEqual({a:'a',b:'b',c:'c'});
  });

  it('iterates values', () => {
    var s = Set(1,2,3);
    var iterator = jest.genMockFunction();
    s.forEach(iterator);
    expect(iterator.mock.calls).toEqual([
      [1, 1, s],
      [2, 2, s],
      [3, 3, s]
    ]);
  });

  it('unions two sets', () => {
    var s1 = Set('a', 'b', 'c');
    var s2 = Set('wow', 'd', 'b');
    var s3 = s1.union(s2);
    expect(s3.toArray()).toEqual(['a', 'b', 'c', 'd', 'wow']);
  });

  it('returns self when union results in no-op', () => {
    var s1 = Set('a', 'b', 'c');
    var s2 = Set('c', 'a');
    var s3 = s1.union(s2);
    expect(s3).toBe(s1);
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
    var s = Set('A').remove('A');
    expect(s).toBe(Set.empty());
  });

  it('unions multiple sets', () => {
    var s = Set('A', 'B', 'C').union(Set('C', 'D', 'E'), Set('D', 'B', 'F'));
    expect(s).is(Set('A','B','C','D','E','F'));
  });

  it('intersects multiple sets', () => {
    var s = Set('A', 'B', 'C').intersect(Set('B', 'C', 'D'), Set('A', 'C', 'E'));
    expect(s).is(Set('C'));
  });

  it('diffs multiple sets', () => {
    var s = Set('A', 'B', 'C').subtract(Set('C', 'D', 'E'), Set('D', 'B', 'F'));
    expect(s).is(Set('A'));
  });

  it('expresses value equality with set-ish sequences', () => {
    var s1 = Set('A', 'B', 'C');
    expect(s1.equals(null)).toBe(false);

    var s2 = Set('C', 'B', 'A');
    expect(s1 === s2).toBe(false);
    expect(Immutable.is(s1, s2)).toBe(true);
    expect(s1.equals(s2)).toBe(true);

    var v1 = Immutable.Map({ A: 'A', B: 'B', C: 'C' });
    expect(Immutable.is(s1, v1)).toBe(true);
  });

  // TODO: more tests

});
