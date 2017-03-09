import { OrderedMap, Seq } from '../';

describe('OrderedMap', () => {
  it('converts from object', () => {
    let m = OrderedMap({ c: 'C', b: 'B', a: 'A' });
    expect(m.get('a')).toBe('A');
    expect(m.get('b')).toBe('B');
    expect(m.get('c')).toBe('C');
    expect(m.toArray()).toEqual(['C', 'B', 'A']);
  });

  it('constructor provides initial values', () => {
    let m = OrderedMap({ a: 'A', b: 'B', c: 'C' });
    expect(m.get('a')).toBe('A');
    expect(m.get('b')).toBe('B');
    expect(m.get('c')).toBe('C');
    expect(m.size).toBe(3);
    expect(m.toArray()).toEqual(['A', 'B', 'C']);
  });

  it('provides initial values in a mixed order', () => {
    let m = OrderedMap({ c: 'C', b: 'B', a: 'A' });
    expect(m.get('a')).toBe('A');
    expect(m.get('b')).toBe('B');
    expect(m.get('c')).toBe('C');
    expect(m.size).toBe(3);
    expect(m.toArray()).toEqual(['C', 'B', 'A']);
  });

  it('constructor accepts sequences', () => {
    let s = Seq({ c: 'C', b: 'B', a: 'A' });
    let m = OrderedMap(s);
    expect(m.get('a')).toBe('A');
    expect(m.get('b')).toBe('B');
    expect(m.get('c')).toBe('C');
    expect(m.size).toBe(3);
    expect(m.toArray()).toEqual(['C', 'B', 'A']);
  });

  it('maintains order when new keys are set', () => {
    let m = OrderedMap()
      .set('A', 'aardvark')
      .set('Z', 'zebra')
      .set('A', 'antelope');
    expect(m.size).toBe(2);
    expect(m.toArray()).toEqual(['antelope', 'zebra']);
  });

  it('resets order when a keys is deleted', () => {
    let m = OrderedMap()
      .set('A', 'aardvark')
      .set('Z', 'zebra')
      .remove('A')
      .set('A', 'antelope');
    expect(m.size).toBe(2);
    expect(m.toArray()).toEqual(['zebra', 'antelope']);
  });

  it('removes correctly', () => {
    let m = OrderedMap({
      A: 'aardvark',
      Z: 'zebra',
    }).remove('A');
    expect(m.size).toBe(1);
    expect(m.get('A')).toBe(undefined);
    expect(m.get('Z')).toBe('zebra');
  });

  it('respects order for equality', () => {
    let m1 = OrderedMap().set('A', 'aardvark').set('Z', 'zebra');
    let m2 = OrderedMap().set('Z', 'zebra').set('A', 'aardvark');
    expect(m1.equals(m2)).toBe(false);
    expect(m1.equals(m2.reverse())).toBe(true);
  });

  it('respects order when merging', () => {
    let m1 = OrderedMap({ A: 'apple', B: 'banana', C: 'coconut' });
    let m2 = OrderedMap({ C: 'chocolate', B: 'butter', D: 'donut' });
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
});
