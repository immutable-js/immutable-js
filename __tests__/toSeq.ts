import { describe, expect, it } from '@jest/globals';
import {
  Collection,
  isIndexed,
  isKeyed,
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
