///<reference path='../resources/jest.d.ts'/>
jest.autoMockOff();

import I = require('../dist/Immutable');
import Set = I.Set;

declare function expect(val: any): ExpectWithIs;

interface ExpectWithIs extends Expect {
  is(expected: any): void;
}

describe('Set', () => {

  beforeEach(function () {
    this.addMatchers({
      is: function(expected) {
        return I.is(this.actual, expected);
      }
    })
  })

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

  it('is persistent to adds', () => {
    var s1 = Set();
    var s2 = s1.add('a');
    var s3 = s2.add('b');
    var s4 = s3.add('c');
    var s5 = s4.add('b');
    expect(s1.length).toBe(0);
    expect(s2.length).toBe(1);
    expect(s3.length).toBe(2);
    expect(s4.length).toBe(3);
    expect(s5.length).toBe(3);
  });

  it('is persistent to deletes', () => {
    var s1 = Set();
    var s2 = s1.add('a');
    var s3 = s2.add('b');
    var s4 = s3.add('c');
    var s5 = s4.delete('b');
    expect(s1.length).toBe(0);
    expect(s2.length).toBe(1);
    expect(s3.length).toBe(2);
    expect(s4.length).toBe(3);
    expect(s5.length).toBe(2);
    expect(s3.has('b')).toBe(true);
    expect(s5.has('b')).toBe(false);
  });

  it('deletes down to empty set', () => {
    var s = Set('A').delete('A');
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
    var s = Set('A', 'B', 'C').difference(Set('C', 'D', 'E'), Set('D', 'B', 'F'));
    expect(s).is(Set('A'));
  });

  // TODO: more tests

});
