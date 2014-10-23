///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

jest.autoMockOff();

import Immutable = require('immutable');
import OrderedMap = Immutable.OrderedMap;

describe('OrderedMap', () => {

  it('converts from object', () => {
    var m = OrderedMap.from({'c': 'C', 'b': 'B', 'a': 'A'});
    expect(m.get('a')).toBe('A');
    expect(m.get('b')).toBe('B');
    expect(m.get('c')).toBe('C');
    expect(m.toArray()).toEqual(['C','B','A']);
  });

  it('constructor provides initial values', () => {
    var m = OrderedMap({'a': 'A', 'b': 'B', 'c': 'C'});
    expect(m.get('a')).toBe('A');
    expect(m.get('b')).toBe('B');
    expect(m.get('c')).toBe('C');
    expect(m.length).toBe(3);
    expect(m.toArray()).toEqual(['A','B','C']);
  });

  it('provides initial values in a mixed order', () => {
    var m = OrderedMap({'c': 'C', 'b': 'B', 'a': 'A'});
    expect(m.get('a')).toBe('A');
    expect(m.get('b')).toBe('B');
    expect(m.get('c')).toBe('C');
    expect(m.length).toBe(3);
    expect(m.toArray()).toEqual(['C','B','A']);
  });

  it('constructor accepts sequences', () => {
    var s = Immutable.Sequence({'c': 'C', 'b': 'B', 'a': 'A'});
    var m = OrderedMap(s);
    expect(m.get('a')).toBe('A');
    expect(m.get('b')).toBe('B');
    expect(m.get('c')).toBe('C');
    expect(m.length).toBe(3);
    expect(m.toArray()).toEqual(['C','B','A']);
  });

  it('maintains order when new keys are set', () => {
    var m = OrderedMap()
      .set('A', 'aardvark')
      .set('Z', 'zebra')
      .set('A', 'antelope');
    expect(m.length).toBe(2);
    expect(m.toArray()).toEqual(['antelope', 'zebra']);
  });

  it('resets order when a keys is deleted', () => {
    var m = OrderedMap()
      .set('A', 'aardvark')
      .set('Z', 'zebra')
      .remove('A')
      .set('A', 'antelope');
    expect(m.length).toBe(2);
    expect(m.toArray()).toEqual(['zebra', 'antelope']);
  });

  it('respects order for equality', () => {
    var m1 = OrderedMap().set('A', 'aardvark').set('Z', 'zebra');
    var m2 = OrderedMap().set('Z', 'zebra').set('A', 'aardvark');
    expect(m1.equals(m2)).toBe(false);
    expect(m1.equals(m2.reverse())).toBe(true);
  });

  it('respects order when merging', () => {
    var m1 = OrderedMap({A: 'apple', B: 'banana', C: 'coconut'});
    var m2 = OrderedMap({C: 'chocolate', B: 'butter', D: 'donut'});
    expect(m1.merge(m2).entrySeq().toArray()).toEqual(
      [['A','apple'],['B','butter'],['C','chocolate'],['D','donut']]
    );
    expect(m2.merge(m1).entrySeq().toArray()).toEqual(
      [['C','coconut'],['B','banana'],['D','donut'],['A','apple']]
    );
  });

  it('can pick keys', () => {
    var m1 = OrderedMap({'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D'});
    var m2 = m1.pick(['a', 'b', 'c', 'd', 'e']);
    var m3 = m2.pick(['f', 'b', 'c', 'a']);
    var m4 = m3.withMutations(m => m.pick(['a', 'c']));
    var m5a = m4.pick([]);
    var m5b = m4.pick(['g']);

    expect(m2.entrySeq().toArray()).toEqual(
      [['a', 'A'],['b','B'],['c','C'],['d','D']]
    );
    expect(m3.entrySeq().toArray()).toEqual(
      [['b','B'],['c','C'],['a', 'A']]
    );
    expect(m4.entrySeq().toArray()).toEqual(
      [['a', 'A'],['c','C']]
    );
    expect(m5a.length).toBe(0);
    expect(m5b.length).toBe(0);
  });

  it('can omit keys', () => {
    var m1 = OrderedMap({'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D'});
    var m2 = m1.omit(['e']);
    var m3 = m2.omit(['a', 'b', 'f']);
    var m4 = m3.withMutations(m => m.omit(['c']));
    var m5 = m4.omit([]);
    var m6 = m5.omit(['d']);

    expect(m2.entrySeq().toArray()).toEqual(
      [['a', 'A'],['b','B'],['c','C'],['d','D']]
    );
    expect(m3.entrySeq().toArray()).toEqual(
      [['c','C'],['d','D']]
    );
    expect(m4.entrySeq().toArray()).toEqual(
      [['d','D']]
    );
    expect(m5.entrySeq().toArray()).toEqual(
      [['d','D']]
    );
    expect(m6.length).toBe(0);
  });

});
