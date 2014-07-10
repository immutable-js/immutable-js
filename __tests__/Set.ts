///<reference path='../resources/jest.d.ts'/>
jest.autoMockOff();
import Immutable = require('../dist/Immutable');
import Set = Immutable.Set;

describe('Set', function() {

  it('constructor provides initial values', function() {
    var s = Set(1,2,3);
    expect(s.has(1)).toBe(true);
    expect(s.has(2)).toBe(true);
    expect(s.has(3)).toBe(true);
    expect(s.has(4)).toBe(false);
  });

  it('converts back to JS array', function() {
    var s = Set(1,2,3);
    expect(s.toArray()).toEqual([1,2,3]);
  });

  it('converts back to JS object', function() {
    var s = Set('a','b','c');
    expect(s.toObject()).toEqual({a:'a',b:'b',c:'c'});
  });

  it('iterates values', function() {
    var s = Set(1,2,3);
    var iterator = jest.genMockFunction();
    s.forEach(iterator);
    expect(iterator.mock.calls).toEqual([
      [1, 1, s],
      [2, 2, s],
      [3, 3, s]
    ]);
  });

  it('merges two sets', function() {
    var s1 = Set('a', 'b', 'c');
    var s2 = Set('wow', 'd', 'b');
    var s3 = s1.merge(s2);
    expect(s3.toArray()).toEqual(['a', 'b', 'c', 'd', 'wow']);
  });

  it('is persistent to adds', function() {
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

  it('is persistent to deletes', function() {
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

  it('deletes down to empty set', function() {
    var s = Set('A').delete('A');
    expect(s).toBe(Set.empty());
  });

  // TODO: more tests

});
