import { describe, expect, it } from '@jest/globals';
import { OrderedSet, Map } from 'immutable';

describe('OrderedSet', () => {
  it('provides initial values in a mixed order', () => {
    const s = OrderedSet.of('C', 'B', 'A');
    expect(s.has('A')).toBe(true);
    expect(s.has('B')).toBe(true);
    expect(s.has('C')).toBe(true);
    expect(s.size).toBe(3);
    expect(s.toArray()).toEqual(['C', 'B', 'A']);
  });

  it('maintains order when new values are added', () => {
    const s = OrderedSet().add('A').add('Z').add('A');
    expect(s.size).toBe(2);
    expect(s.toArray()).toEqual(['A', 'Z']);
  });

  it('resets order when a value is deleted', () => {
    const s = OrderedSet().add('A').add('Z').remove('A').add('A');
    expect(s.size).toBe(2);
    expect(s.toArray()).toEqual(['Z', 'A']);
  });

  it('removes correctly', () => {
    const s = OrderedSet(['A', 'Z']).remove('A');
    expect(s.size).toBe(1);
    expect(s.has('A')).toBe(false);
    expect(s.has('Z')).toBe(true);
  });

  it('respects order for equality', () => {
    const s1 = OrderedSet.of('A', 'Z');
    const s2 = OrderedSet.of('Z', 'A');
    expect(s1.equals(s2)).toBe(false);
    expect(s1.equals(s2.reverse())).toBe(true);
  });

  it('respects order when unioning', () => {
    const s1 = OrderedSet.of('A', 'B', 'C');
    const s2 = OrderedSet.of('C', 'B', 'D');
    expect(s1.union(s2).toArray()).toEqual(['A', 'B', 'C', 'D']);
    expect(s2.union(s1).toArray()).toEqual(['C', 'B', 'D', 'A']);
  });

  it('can be zipped', () => {
    const s1 = OrderedSet.of('A', 'B', 'C');
    const s2 = OrderedSet.of('C', 'B', 'D');
    expect(s1.zip(s2).toArray()).toEqual([
      ['A', 'C'],
      ['B', 'B'],
      ['C', 'D'],
    ]);
    expect(s1.zipWith((c1, c2) => c1 + c2, s2).toArray()).toEqual([
      'AC',
      'BB',
      'CD',
    ]);
  });

  /**
   * @see https://github.com/immutable-js/immutable-js/issues/1716
   */
  it('handles `subtract` when Set contains >=32 elements', () => {
    const fillArray = (nb) =>
      Array(nb)
        .fill(1)
        .map((el, i) => i + 1);

    const capacity = 32;
    // items from keys 0 to 31 and values 1 to 32
    const defaultItems = fillArray(capacity);

    const allItems = OrderedSet(defaultItems);

    const partialCapacity = Math.ceil(capacity / 2) + 1;
    const someOfThem = fillArray(partialCapacity);
    expect(someOfThem.length).toBe(17);

    const existingItems = OrderedSet(someOfThem).intersect(allItems);

    expect(allItems.subtract(existingItems).size).toBe(15);
    expect(allItems.subtract(existingItems).size + someOfThem.length).toBe(32);
  });

  /**
   * @see https://github.com/immutable-js/immutable-js/issues/1603
   */
  it('handles consecutive `subtract` invocations', () => {
    let a = OrderedSet();
    let b = OrderedSet();
    let c;
    let d;
    // Set a to 0-45
    for (let i = 0; i < 46; i++) {
      a = a.add(i);
    }
    // Set b to 0-24
    for (let i = 0; i < 25; i++) {
      b = b.add(i);
    }
    // Set c to 0-23
    // eslint-disable-next-line prefer-const
    c = b.butLast();

    // Set d to 0-22
    // eslint-disable-next-line prefer-const
    d = c.butLast();

    // Internal list resizing happens on the final `subtract` when subtracting d from a
    const aNotB = a.subtract(b);
    const aNotC = a.subtract(c);
    const aNotD = a.subtract(d);

    expect(aNotB.size).toBe(21);
    expect(aNotC.size).toBe(22);
    expect(aNotD.size).toBe(23);
  });

  it('keeps the Set ordered when updating a value with .map()', () => {
    const first = Map({ id: 1, valid: true });
    const second = Map({ id: 2, valid: true });
    const third = Map({ id: 3, valid: true });
    const initial = OrderedSet([first, second, third]);

    const out = initial.map((t) => {
      if (t.get('id') === 2) {
        return t.set('valid', false);
      }
      return t;
    });

    const expected = OrderedSet([
      Map({ id: 1, valid: true }),
      Map({ id: 2, valid: false }),
      Map({ id: 3, valid: true }),
    ]);

    expect(out).toEqual(expected);

    expect(out.has(first)).toBe(true);
    expect(out.has(second)).toBe(false);
    expect(out.has(third)).toBe(true);
  });

  it('hashCode should return the same value if the values are the same', () => {
    const set1 = OrderedSet(['hello']);
    const set2 = OrderedSet(['goodbye', 'hello']).remove('goodbye');

    expect(set1.hashCode()).toBe(set2.hashCode());
  });
});
