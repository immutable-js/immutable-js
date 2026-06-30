import {
  Seq,
  isCollection,
  isIndexed,
  isKeyed,
  isOrdered,
  isSeq,
} from 'immutable';
import { describe, expect, it } from '@jest/globals';

describe('Seq', () => {
  it('constructor provides different instances', () => {
    expect(Seq()).not.toBe(Seq());
    expect(Seq()).toEqual(Seq());
    expect(Seq([1])).not.toBe(Seq([1]));
    expect(Seq([1])).toEqual(Seq([1]));
  });

  it('returns undefined if empty and first is called without default argument', () => {
    expect(Seq().first()).toBeUndefined();
  });

  it('returns undefined if empty and last is called without default argument', () => {
    expect(Seq().last()).toBeUndefined();
  });

  it('returns default value if empty and first is called with default argument', () => {
    expect(Seq().first({})).toEqual({});
  });

  it('returns default value if empty and last is called with default argument', () => {
    expect(Seq().last({})).toEqual({});
  });

  it('can be empty', () => {
    expect(Seq().size).toBe(0);
  });

  it('accepts an array', () => {
    expect(Seq([1, 2, 3]).size).toBe(3);
  });

  it('accepts an object', () => {
    expect(Seq({ a: 1, b: 2, c: 3 }).size).toBe(3);
  });

  it('accepts an object with a next property', () => {
    expect(Seq({ a: 1, b: 2, next: (_: unknown) => _ }).size).toBe(3);
  });

  it('accepts a collection string', () => {
    expect(Seq('foo').size).toBe(3);
  });

  it('accepts arbitrary objects', () => {
    function Foo(this: { bar: string; baz: string }) {
      this.bar = 'bar';
      this.baz = 'baz';
    }
    // @ts-expect-error -- any type for too complex object
    expect(Seq(new Foo()).size).toBe(2);
  });

  it('accepts another sequence', () => {
    const seq = Seq([1, 2, 3]);
    expect(Seq(seq).size).toBe(3);
  });

  it('accepts a string', () => {
    const seq = Seq('abc');
    expect(seq.size).toBe(3);
    expect(seq.get(1)).toBe('b');
    expect(seq.join('')).toBe('abc');
  });

  it('accepts an array-like', () => {
    const seq = Seq({ length: 2, 0: 'a', 1: 'b' });
    expect(isIndexed(seq)).toBe(true);
    expect(seq.size).toBe(2);
    expect(seq.get(1)).toBe('b');

    const map = Seq({ length: 1, foo: 'bar' });
    expect(isIndexed(map)).toBe(false);
    expect(map.size).toBe(2);
    expect(map.get('foo')).toBe('bar');

    const empty = Seq({ length: 0 });
    expect(isIndexed(empty)).toBe(true);
    expect(empty.size).toEqual(0);
  });

  it('accepts a JS (global) Map', () => {
    const seq = Seq(
      new global.Map([
        ['a', 'A'],
        ['b', 'B'],
        ['c', 'C'],
      ])
    );
    expect(isKeyed(seq)).toBe(true);
    expect(seq.size).toBe(3);
  });

  it('accepts a JS (global) Set', () => {
    const seq = Seq(new global.Set(['a', 'b', 'c']));
    expect(isIndexed(seq)).toBe(false);
    expect(isKeyed(seq)).toBe(false);
    expect(seq.size).toBe(3);
  });

  it('does not accept a scalar', () => {
    expect(() => {
      // @ts-expect-error -- test that runtime does throw
      Seq(3);
    }).toThrow(
      'Expected Array or collection object of values, or keyed object: 3'
    );
  });

  it('detects sequences', () => {
    const seq = Seq([1, 2, 3]);
    expect(Seq.isSeq(seq)).toBe(true);
    expect(isCollection(seq)).toBe(true);
  });

  it('Does not infinite loop when sliced with NaN', () => {
    const list = Seq([1, 2, 3, 4, 5]);
    expect(list.slice(0, NaN).toJS()).toEqual([]);
    expect(list.slice(NaN).toJS()).toEqual([1, 2, 3, 4, 5]);
  });

  it('Does not infinite loop when spliced with negative number #559', () => {
    const dog = Seq(['d', 'o', 'g']);
    const dg = dog.filter((c) => c !== 'o');
    const dig = dg.splice(-1, 0, 'i');
    expect(dig.toJS()).toEqual(['d', 'i', 'g']);
  });

  it('Does not infinite loop when an undefined number is passed to take', () => {
    const list = Seq([1, 2, 3, 4, 5]);
    expect(list.take(NaN).toJS()).toEqual([]);
  });

  it('Converts deeply toJS after converting to entries', () => {
    const list = Seq([Seq([1, 2]), Seq({ a: 'z' })]);
    expect(list.entrySeq().toJS()).toEqual([
      [0, [1, 2]],
      [1, { a: 'z' }],
    ]);

    const map = Seq({ x: Seq([1, 2]), y: Seq({ a: 'z' }) });
    expect(map.entrySeq().toJS()).toEqual([
      ['x', [1, 2]],
      ['y', { a: 'z' }],
    ]);
  });
});

describe('Seq brands across the hierarchy', () => {
  // Every Seq kind extends its matching collection kind, so each prototype
  // carries the Seq brand itself (it is no longer inherited from a shared
  // SeqImpl ancestor).
  it('marks every Seq kind as a Seq', () => {
    expect(isSeq(Seq())).toBe(true);
    expect(isSeq(Seq.Keyed({ a: 1 }))).toBe(true);
    expect(isSeq(Seq.Indexed([1]))).toBe(true);
    expect(isSeq(Seq.Set([1]))).toBe(true);
  });

  it('marks operation-built Seqs as Seqs', () => {
    expect(isSeq(Seq.Keyed({ a: 1 }).map((v) => v))).toBe(true);
    expect(isSeq(Seq.Indexed([1, 2]).filter((v) => v > 1))).toBe(true);
    expect(isSeq(Seq.Set([1, 2]).map((v) => v))).toBe(true);
    expect(isSeq(Seq([1, 2]).reverse())).toBe(true);
  });

  it('keeps the kind brands', () => {
    expect(isKeyed(Seq.Keyed({ a: 1 }))).toBe(true);
    expect(isKeyed(Seq.Indexed([1]))).toBe(false);
    expect(isIndexed(Seq.Indexed([1]))).toBe(true);
    expect(isIndexed(Seq.Set([1]))).toBe(false);
    // object-backed and indexed Seqs are ordered, set Seqs are not
    expect(isOrdered(Seq({ a: 1 }))).toBe(true);
    expect(isOrdered(Seq([1]))).toBe(true);
    expect(isOrdered(Seq.Set([1]))).toBe(false);
  });
});

describe('Seq kinds expose the kind-specific methods', () => {
  // These methods come from the matching `*CollectionImpl` classes (inherited
  // since the re-parenting; they were copied by `mixin` before).
  it('keyed Seq: flip / mapKeys / mapEntries / entries iterator / toJSON', () => {
    expect(Seq.Keyed({ a: 1 }).flip().get(1)).toBe('a');
    expect(
      Seq({ a: 1, b: 2 })
        .mapKeys((k) => k.toUpperCase())
        .toObject()
    ).toEqual({ A: 1, B: 2 });
    expect(
      Seq({ a: 1 })
        .mapEntries(([k, v]) => [k.toUpperCase(), v * 2])
        .toObject()
    ).toEqual({ A: 2 });
    expect([...Seq.Keyed({ a: 1 })]).toEqual([['a', 1]]);
    expect(Seq.Keyed({ a: 1 }).toJSON()).toEqual({ a: 1 });
  });

  it('indexed Seq: interpose / splice / zip / keySeq', () => {
    expect(Seq([1, 2, 3]).interpose(0).toArray()).toEqual([1, 0, 2, 0, 3]);
    expect(Seq(['d', 'o', 'g']).splice(1, 1).toArray()).toEqual(['d', 'g']);
    expect(
      Seq([1, 2])
        .zip(Seq(['a', 'b']))
        .toArray()
    ).toEqual([
      [1, 'a'],
      [2, 'b'],
    ]);
    expect(Seq([10, 20]).keySeq().toArray()).toEqual([0, 1]);
  });

  it('set Seq: has / keys-as-values', () => {
    expect(Seq.Set(['a', 'b']).has('b')).toBe(true);
    expect(Seq.Set(['a', 'b']).has('c')).toBe(false);
    expect([...Seq.Set(['a']).keys()]).toEqual(['a']);
  });
});

describe('Seq toString across the hierarchy', () => {
  // `toString` was inherited from the shared `SeqImpl` ancestor before the
  // re-parenting; each kind now has to carry it (the base `CollectionImpl`
  // returns the placeholder `'[Collection]'`).
  it('prints each kind with the Seq prefix', () => {
    expect(Seq([1, 2, 3]).toString()).toBe('Seq [ 1, 2, 3 ]');
    expect(Seq.Keyed({ a: 1, b: 2 }).toString()).toBe('Seq { "a": 1, "b": 2 }');
    expect(Seq.Set([1, 2, 3]).toString()).toBe('Seq { 1, 2, 3 }');
  });

  it('prints empty Seqs with the Seq prefix', () => {
    expect(Seq([]).toString()).toBe('Seq []');
    expect(Seq.Keyed({}).toString()).toBe('Seq {}');
    expect(Seq.Set([]).toString()).toBe('Seq {}');
  });
});

describe('cacheResult', () => {
  function* numbers() {
    yield 1;
    yield 2;
    yield 3;
  }

  it('materializes an unknown size', () => {
    const seq = Seq(numbers());
    expect(seq.size).toBe(undefined);
    seq.cacheResult();
    expect(seq.size).toBe(3);
  });

  it('makes a one-shot iterable re-iterable from the cache', () => {
    const seq = Seq(numbers()).cacheResult();
    // The generator is consumed during caching; both reads come from the cache.
    expect(seq.toArray()).toEqual([1, 2, 3]);
    expect(seq.toArray()).toEqual([1, 2, 3]);
    expect([...seq.values()]).toEqual([1, 2, 3]);
    expect([...seq.entries()]).toEqual([
      [0, 1],
      [1, 2],
      [2, 3],
    ]);
  });

  it('is used internally to reverse an iterable-backed Seq', () => {
    expect(Seq(numbers()).reverse().toArray()).toEqual([3, 2, 1]);
  });

  it('is a no-op on a Seq with a concrete backing', () => {
    const seq = Seq([1, 2]);
    expect(seq.cacheResult()).toBe(seq);
    expect(seq.size).toBe(2);
  });

  it('caches an operation-built Seq', () => {
    const mapped = Seq({ a: 1, b: 2 }).map((v) => v * 10);
    mapped.cacheResult();
    expect(mapped.size).toBe(2);
    expect(mapped.toObject()).toEqual({ a: 10, b: 20 });
  });
});
