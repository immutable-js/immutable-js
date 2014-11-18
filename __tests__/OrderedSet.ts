///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

jest.autoMockOff();

import Immutable = require('immutable');
import OrderedSet = Immutable.OrderedSet;

describe('OrderedSet', () => {

  it('provides initial values in a mixed order', () => {
    var s = OrderedSet.of('C', 'B', 'A');
    expect(s.has('A')).toBe(true);
    expect(s.has('B')).toBe(true);
    expect(s.has('C')).toBe(true);
    expect(s.size).toBe(3);
    expect(s.toArray()).toEqual(['C','B','A']);
  });

  it('maintains order when new values are added', () => {
    var s = OrderedSet()
      .add('A')
      .add('Z')
      .add('A');
    expect(s.size).toBe(2);
    expect(s.toArray()).toEqual(['A', 'Z']);
  });

  it('resets order when a value is deleted', () => {
    var s = OrderedSet()
      .add('A')
      .add('Z')
      .remove('A')
      .add('A');
    expect(s.size).toBe(2);
    expect(s.toArray()).toEqual(['Z', 'A']);
  });

  it('removes correctly', () => {
    var s = OrderedSet([ 'A', 'Z' ]).remove('A');
    expect(s.size).toBe(1);
    expect(s.has('A')).toBe(false);
    expect(s.has('Z')).toBe(true);
  });

  it('respects order for equality', () => {
    var s1 = OrderedSet.of('A', 'Z')
    var s2 = OrderedSet.of('Z', 'A')
    expect(s1.equals(s2)).toBe(false);
    expect(s1.equals(s2.reverse())).toBe(true);
  });

  it('respects order when unioning', () => {
    var s1 = OrderedSet.of('A', 'B', 'C');
    var s2 = OrderedSet.of('C', 'B', 'D');
    expect(s1.union(s2).toArray()).toEqual(['A','B','C','D']);
    expect(s2.union(s1).toArray()).toEqual(['C','B','D','A']);
  });

});
