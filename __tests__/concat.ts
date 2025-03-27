import { List, Seq, Set } from 'immutable';
import { describe, expect, it } from 'vitest';

describe('concat', () => {
  it('concats two sequences', () => {
    const a = Seq([1, 2, 3]);
    const b = Seq([4, 5, 6]);
    expect(a.concat(b).size).toBe(6);
    expect(a.concat(b).toArray()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('concats two object sequences', () => {
    const a = Seq({ a: 1, b: 2, c: 3 });
    const b = Seq({ d: 4, e: 5, f: 6 });
    expect(a.size).toBe(3);
    expect(a.concat(b).size).toBe(6);
    expect(a.concat(b).toObject()).toEqual({
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      e: 5,
      f: 6,
    });
  });

  it('concats objects to keyed seq', () => {
    const a = Seq({ a: 1, b: 2, c: 3 });
    const b = { d: 4, e: 5, f: 6 };
    expect(a.concat(b).toObject()).toEqual({
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      e: 5,
      f: 6,
    });
  });

  it('doesnt concat raw arrays to keyed seq', () => {
    const a = Seq({ a: 1, b: 2, c: 3 });
    const b = [4, 5, 6];
    expect(() => {
      // @ts-expect-error -- test that runtime does throw
      a.concat(b).toJS();
    }).toThrow('Expected [K, V] tuple: 4');
  });

  it('concats arrays to indexed seq', () => {
    const a = Seq([1, 2, 3]);
    const b = [4, 5, 6];
    expect(a.concat(b).size).toBe(6);
    expect(a.concat(b).toArray()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('concats values', () => {
    const a = Seq([1, 2, 3]);
    expect(a.concat(4, 5, 6).size).toBe(6);
    expect(a.concat(4, 5, 6).toArray()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('doesnt concat objects to indexed seq', () => {
    const a = Seq([0, 1, 2, 3]);
    const b = { 4: 4 };
    const i = a.concat(b);
    expect(i.size).toBe(5);
    expect(i.get(4)).toBe(b);
    expect(i.toArray()).toEqual([0, 1, 2, 3, { 4: 4 }]);
  });

  it('concats multiple arguments', () => {
    const a = Seq([1, 2, 3]);
    const b = [4, 5, 6];
    const c = [7, 8, 9];
    expect(a.concat(b, c).size).toBe(9);
    expect(a.concat(b, c).toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('can concat itself!', () => {
    const a = Seq([1, 2, 3]);
    expect(a.concat(a, a).size).toBe(9);
    expect(a.concat(a, a).toArray()).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3]);
  });

  it('returns itself when concat does nothing', () => {
    const a = Seq([1, 2, 3]);
    const b = Seq();
    expect(a.concat()).toBe(a);
    expect(a.concat(b)).toBe(a);
    expect(b.concat(b)).toBe(b);
  });

  it('returns non-empty item when concat does nothing', () => {
    const a = Seq([1, 2, 3]);
    const b = Seq();
    expect(a.concat(b)).toBe(a);
    expect(b.concat(a)).toBe(a);
    expect(b.concat(b, b, b, a, b, b)).toBe(a);
  });

  it('always returns the same type', () => {
    const a = Set([1, 2, 3]);
    const b = List();
    expect(b.concat(a)).not.toBe(a);
    expect(List.isList(b.concat(a))).toBe(true);
    expect(b.concat(a)).toEqual(List([1, 2, 3]));
  });

  it('iterates repeated keys', () => {
    const a = Seq({ a: 1, b: 2, c: 3 });
    expect(a.concat(a, a).toObject()).toEqual({ a: 1, b: 2, c: 3 });
    expect(a.concat(a, a).valueSeq().toArray()).toEqual([
      1, 2, 3, 1, 2, 3, 1, 2, 3,
    ]);
    expect(a.concat(a, a).keySeq().toArray()).toEqual([
      'a',
      'b',
      'c',
      'a',
      'b',
      'c',
      'a',
      'b',
      'c',
    ]);
    expect(a.concat(a, a).toArray()).toEqual([
      ['a', 1],
      ['b', 2],
      ['c', 3],
      ['a', 1],
      ['b', 2],
      ['c', 3],
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]);
  });

  it('lazily reverses un-indexed sequences', () => {
    const a = Seq({ a: 1, b: 2, c: 3 });
    const b = Seq({ d: 4, e: 5, f: 6 });
    expect(a.concat(b).reverse().keySeq().toArray()).toEqual([
      'f',
      'e',
      'd',
      'c',
      'b',
      'a',
    ]);
  });

  it('lazily reverses indexed sequences', () => {
    const a = Seq([1, 2, 3]);
    expect(a.concat(a, a).reverse().size).toBe(9);
    expect(a.concat(a, a).reverse().toArray()).toEqual([
      3, 2, 1, 3, 2, 1, 3, 2, 1,
    ]);
  });

  it('lazily reverses indexed sequences with unknown size, maintaining indicies', () => {
    const a = Seq([1, 2, 3]).filter(() => true);
    expect(a.size).toBe(undefined); // Note: lazy filter does not know what size in O(1).
    expect(a.concat(a, a).toKeyedSeq().reverse().size).toBe(undefined);
    expect(a.concat(a, a).toKeyedSeq().reverse().toArray()).toEqual([
      [8, 3],
      [7, 2],
      [6, 1],
      [5, 3],
      [4, 2],
      [3, 1],
      [2, 3],
      [1, 2],
      [0, 1],
    ]);
  });

  it('counts from the end of the indexed sequence on negative index', () => {
    const i = List.of(9, 5, 3, 1).map((x) => -x);
    expect(i.get(0)).toBe(-9);
    expect(i.get(-1)).toBe(-1);
    expect(i.get(-4)).toBe(-9);
    expect(i.get(-5, 888)).toBe(888);
  });

  it('should iterate on many concatenated sequences', () => {
    let meta = Seq();

    for (let i = 0; i < 10000; ++i) {
      meta = meta.concat(i) as Seq<unknown, unknown>; // TODO fix typing
    }

    expect(meta.toList().size).toBe(10000);
  }, 20000);

  it('should handle iterator on many concatenated sequences', () => {
    const nbLoops = 10000;
    let meta = Seq();
    for (let i = 1; i < nbLoops; i++) {
      meta = meta.concat(i) as Seq<unknown, unknown>; // TODO fix typing
    }
    const it = meta[Symbol.iterator]();
    let done = false;
    let i = 0;
    while (!done) {
      const result = it.next();
      i++;
      done = !!result.done;
    }
    expect(i).toBe(nbLoops);
  }, 20000);

  it('should iterate on reverse order on concatenated sequences', () => {
    let meta = Seq([1]);
    meta = meta.concat(42);
    const it = meta.reverse()[Symbol.iterator]();
    const result = it.next();
    expect(result).toEqual({
      done: false,
      value: 42,
    });
  });
});
