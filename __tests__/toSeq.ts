import { describe, expect, it } from '@jest/globals';
import {
  Collection,
  isIndexed,
  isKeyed,
  isOrdered,
  isSeq,
  List,
  Map,
  OrderedMap,
  OrderedSet,
  Range,
  Repeat,
  Seq,
  Set,
  Stack,
} from 'immutable';

describe('toSeq', () => {
  it('returns a keyed Seq for a keyed collection, preserving entries', () => {
    const seq = Map({ a: 1, b: 2 }).toSeq();
    expect(isSeq(seq)).toBe(true);
    expect(isKeyed(seq)).toBe(true);
    expect(seq.toObject()).toEqual({ a: 1, b: 2 });
  });

  it('returns an indexed Seq for an indexed collection, preserving order', () => {
    const seq = List([1, 2, 3]).toSeq();
    expect(isSeq(seq)).toBe(true);
    expect(isIndexed(seq)).toBe(true);
    expect(seq.toArray()).toEqual([1, 2, 3]);
  });

  it('returns an indexed Seq for a Stack, preserving order', () => {
    const seq = Stack([1, 2, 3]).toSeq();
    expect(isSeq(seq)).toBe(true);
    expect(isIndexed(seq)).toBe(true);
    expect(seq.toArray()).toEqual([1, 2, 3]);
  });

  it('returns a set Seq for a set collection, preserving values', () => {
    const seq = Set([1, 2, 3]).toSeq();
    expect(isSeq(seq)).toBe(true);
    expect(isKeyed(seq)).toBe(false);
    expect(isIndexed(seq)).toBe(false);
    expect(seq.toArray().sort()).toEqual([1, 2, 3]);
  });

  it('returns a set Seq for an OrderedSet, preserving insertion order', () => {
    const seq = OrderedSet([3, 1, 2]).toSeq();
    expect(isSeq(seq)).toBe(true);
    expect(isKeyed(seq)).toBe(false);
    expect(isIndexed(seq)).toBe(false);
    expect(seq.toArray()).toEqual([3, 1, 2]);
  });

  it('dispatches on the kind when called through the base Collection', () => {
    expect(isIndexed(Collection([1, 2, 3]).toSeq())).toBe(true);
    expect(isKeyed(Collection({ a: 1 }).toSeq())).toBe(true);
  });

  it('is idempotent on a Seq (returns an equivalent Seq)', () => {
    const seq = Seq([1, 2, 3]);
    const again = seq.toSeq();
    expect(isSeq(again)).toBe(true);
    expect(again.toArray()).toEqual([1, 2, 3]);
  });

  it('returns the same instance for a keyed Seq', () => {
    const seq = Seq.Keyed({ a: 1, b: 2 });
    expect(seq.toSeq()).toBe(seq);
    expect(isKeyed(seq.toSeq())).toBe(true);
  });

  it('returns the same instance for an indexed Seq', () => {
    const seq = Seq.Indexed([1, 2, 3]);
    expect(seq.toSeq()).toBe(seq);
    expect(isIndexed(seq.toSeq())).toBe(true);
  });

  it('returns the same instance for a set Seq', () => {
    const seq = Seq.Set([1, 2, 3]);
    expect(seq.toSeq()).toBe(seq);
    expect(isKeyed(seq.toSeq())).toBe(false);
    expect(isIndexed(seq.toSeq())).toBe(false);
  });

  it('keeps ordering for ordered keyed collections', () => {
    const seq = OrderedMap([
      ['b', 2],
      ['a', 1],
    ]).toSeq();
    expect(isKeyed(seq)).toBe(true);
    expect(seq.keySeq().toArray()).toEqual(['b', 'a']);
  });

  it('is lazy: works on an infinite Range', () => {
    const seq = Range(0, Infinity).toSeq();
    expect(isSeq(seq)).toBe(true);
    expect(seq.take(3).toArray()).toEqual([0, 1, 2]);
  });

  it('is lazy: works on an infinite Repeat', () => {
    const seq = Repeat('x', Infinity).toSeq();
    expect(isSeq(seq)).toBe(true);
    expect(isIndexed(seq)).toBe(true);
    expect(seq.take(3).toArray()).toEqual(['x', 'x', 'x']);
  });
});

describe('map (migrated to class)', () => {
  it('maps values of a keyed collection and stays keyed', () => {
    const mapped = Map({ a: 1, b: 2 }).map((x) => 10 * x);
    expect(isKeyed(mapped)).toBe(true);
    expect(mapped.toObject()).toEqual({ a: 10, b: 20 });
  });

  it('maps values of an indexed collection and stays indexed', () => {
    const mapped = List([1, 2, 3]).map((x) => 10 * x);
    expect(isIndexed(mapped)).toBe(true);
    expect(mapped.toArray()).toEqual([10, 20, 30]);
  });

  it('maps values of a set collection', () => {
    const mapped = Set([1, 2, 3]).map((x) => 10 * x);
    expect(mapped.toArray().sort((a, b) => a - b)).toEqual([10, 20, 30]);
  });

  it('passes value, key and the collection to the mapper', () => {
    const seen: Array<[number, string]> = [];
    Map({ a: 1, b: 2 }).map((value, key, iter) => {
      expect(iter.get(key)).toBe(value);
      seen.push([value, key]);
      return value;
    });
    expect(seen).toEqual([
      [1, 'a'],
      [2, 'b'],
    ]);
  });
});

describe('toIndexedSeq', () => {
  it('re-indexes the values of a keyed collection', () => {
    const seq = Map({ a: 1, b: 2, c: 3 }).toIndexedSeq();

    expect(isSeq(seq)).toBe(true);
    expect(isIndexed(seq)).toBe(true);
    expect(isKeyed(seq)).toBe(false);
    expect(seq.size).toBe(3);
    expect(seq.toArray()).toEqual([1, 2, 3]);
    expect(seq.entrySeq().toArray()).toEqual([
      [0, 1],
      [1, 2],
      [2, 3],
    ]);
  });

  it('delegates includes to the wrapped collection', () => {
    const seq = Map({ a: 1, b: 2 }).toIndexedSeq();

    expect(seq.includes(2)).toBe(true);
    expect(seq.includes(9)).toBe(false);
  });

  it('re-indexes from the end when iterated in reverse', () => {
    const reversed = Map({ a: 1, b: 2, c: 3 }).toIndexedSeq().reverse();

    expect(reversed.toArray()).toEqual([3, 2, 1]);
    expect(reversed.entrySeq().toArray()).toEqual([
      [0, 3],
      [1, 2],
      [2, 1],
    ]);
  });

  it('only knows its size once the wrapped lazy seq is cached', () => {
    const lazy = Seq({ a: 1, b: 2 })
      .filter(() => true)
      .toIndexedSeq();

    expect(lazy.size).toBe(undefined);
    expect(lazy.cacheResult().size).toBe(2);
    expect(lazy.toArray()).toEqual([1, 2]);
  });

  it('reverses a wrapped lazy seq of unknown size', () => {
    const reversed = Seq({ a: 1, b: 2, c: 3 })
      .filter((v) => v !== 2)
      .toIndexedSeq()
      .reverse();

    expect(reversed.toArray()).toEqual([3, 1]);
  });
});

describe('toSetSeq', () => {
  it('makes a set-like seq whose keys are its values', () => {
    const seq = List(['a', 'b']).toSetSeq();

    expect(isSeq(seq)).toBe(true);
    expect(isIndexed(seq)).toBe(false);
    expect(isKeyed(seq)).toBe(false);
    expect(seq.entrySeq().toArray()).toEqual([
      ['a', 'a'],
      ['b', 'b'],
    ]);
  });

  it('does not deduplicate the wrapped values', () => {
    const seq = List(['a', 'b', 'a']).toSetSeq();

    expect(seq.size).toBe(3);
    expect(seq.toArray()).toEqual(['a', 'b', 'a']);
  });

  it('delegates has to the wrapped collection includes', () => {
    const seq = List(['a', 'b']).toSetSeq();

    expect(seq.has('a')).toBe(true);
    expect(seq.has('z')).toBe(false);
  });
});

describe('toKeyedSeq', () => {
  it('keeps the indices of an indexed collection as keys', () => {
    const seq = List(['a', 'b', 'c']).toKeyedSeq();

    expect(isSeq(seq)).toBe(true);
    expect(isKeyed(seq)).toBe(true);
    expect(isOrdered(seq)).toBe(true);
    expect(seq.get(1)).toBe('b');
    expect(seq.has(2)).toBe(true);
    expect(seq.entrySeq().toArray()).toEqual([
      [0, 'a'],
      [1, 'b'],
      [2, 'c'],
    ]);
  });

  it('preserves the original indices when reversed, but re-indexes its valueSeq', () => {
    const reversed = List(['a', 'b', 'c']).toKeyedSeq().reverse();

    expect(reversed.entrySeq().toArray()).toEqual([
      [2, 'c'],
      [1, 'b'],
      [0, 'a'],
    ]);
    expect(reversed.valueSeq().entrySeq().toArray()).toEqual([
      [0, 'c'],
      [1, 'b'],
      [2, 'a'],
    ]);
  });

  it('preserves the original indices when mapped, but re-indexes its valueSeq', () => {
    const mapped = List(['a', 'b', 'c'])
      .toKeyedSeq()
      .map((v) => v.toUpperCase());

    expect(mapped.entrySeq().toArray()).toEqual([
      [0, 'A'],
      [1, 'B'],
      [2, 'C'],
    ]);
    expect(mapped.valueSeq().entrySeq().toArray()).toEqual([
      [0, 'A'],
      [1, 'B'],
      [2, 'C'],
    ]);
  });

  it('delegates get and has to the wrapped collection', () => {
    const seq = Map([['a', 1]]).toKeyedSeq();

    expect(seq.get('a')).toBe(1);
    expect(seq.get('z', 'missing')).toBe('missing');
    expect(seq.has('a')).toBe(true);
    expect(seq.has('z')).toBe(false);
  });
});

describe('fromEntrySeq', () => {
  it('makes a keyed seq from a seq of entry tuples', () => {
    const seq = Seq([
      ['a', 1],
      ['b', 2],
    ] as Array<[string, number]>).fromEntrySeq();

    expect(isSeq(seq)).toBe(true);
    expect(isKeyed(seq)).toBe(true);
    expect(seq.get('a')).toBe(1);
    expect(seq.toObject()).toEqual({ a: 1, b: 2 });
  });

  it('reads entries through get when they are collections', () => {
    const seq = Seq([List(['a', 1])]).fromEntrySeq();

    expect(seq.get('a')).toBe(1);
    expect(seq.toObject()).toEqual({ a: 1 });
  });

  it('returns the wrapped entries from entrySeq', () => {
    const entries: Array<[string, number]> = [
      ['a', 1],
      ['b', 2],
    ];

    expect(Seq(entries).fromEntrySeq().entrySeq().toArray()).toEqual(entries);
  });

  it('skips holes in the parent iteration', () => {
    const seq = Seq([undefined, ['a', 1] as [string, number]]).fromEntrySeq();

    expect(seq.toObject()).toEqual({ a: 1 });
  });

  it('throws when iterating a non-entry value', () => {
    const seq = Seq([1, 2]).fromEntrySeq();

    expect(() => seq.toObject()).toThrow(
      new TypeError('Expected [K, V] tuple: 1')
    );
  });

  it('only knows its size once the wrapped lazy seq is cached', () => {
    const lazy = Seq([
      ['a', 1],
      ['b', 2],
    ] as Array<[string, number]>)
      .filter(() => true)
      .fromEntrySeq();

    expect(lazy.size).toBe(undefined);
    expect(lazy.cacheResult().size).toBe(2);
  });
});

describe('concat seq kind', () => {
  it('adopts the kind brands of the first concatenated iterable', () => {
    const keyed = Seq({ a: 1 }).concat(Seq({ b: 2 }));
    expect(isKeyed(keyed)).toBe(true);
    expect(isOrdered(keyed)).toBe(true);

    const indexed = Seq([1]).concat(Seq([2]));
    expect(isIndexed(indexed)).toBe(true);
    expect(isKeyed(indexed)).toBe(false);

    const set = Seq([1, 2])
      .toSetSeq()
      .concat(Seq([3]).toSetSeq());
    expect(isIndexed(set)).toBe(false);
    expect(isKeyed(set)).toBe(false);
    expect(isSeq(set)).toBe(true);
  });

  it('sums the sizes, staying unknown if any part is unknown', () => {
    expect(Seq([1, 2]).concat(Seq([3])).size).toBe(3);

    const lazy = Seq([3]).filter(() => true);
    expect(Seq([1, 2]).concat(lazy).size).toBe(undefined);
    expect(Seq([1, 2]).concat(lazy).cacheResult().size).toBe(3);
  });

  it('flattens nested concat seqs and still iterates in order', () => {
    const nested = Seq([1]).concat(Seq([2]).concat(Seq([3])), Seq([4]));

    expect(nested.size).toBe(4);
    expect(nested.toArray()).toEqual([1, 2, 3, 4]);
    expect(nested.reverse().toArray()).toEqual([4, 3, 2, 1]);
  });
});
