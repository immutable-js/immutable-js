import {
  Collection,
  List,
  Map,
  OrderedMap,
  OrderedSet,
  Range,
  Seq,
  Set,
  Stack,
  isOrdered,
} from 'immutable';
import { describe, expect, it } from '@jest/globals';

type StringCollection = Collection<unknown, string>;

const kinds: Array<
  [kind: string, constructor: (v: Array<string>) => StringCollection]
> = [
  ['List', List],
  ['Set', Set],
  ['OrderedSet', OrderedSet],
  ['Stack', Stack],
  ['Seq', Seq],
];

const orderedSources: Array<[kind: string, source: StringCollection]> = [
  ['List', List(['a', 'bb'])],
  ['OrderedSet', OrderedSet(['a', 'bb'])],
  ['OrderedMap', OrderedMap({ a: 'a', b: 'bb' })],
];

describe('count', () => {
  it('counts sequences with known lengths', () => {
    expect(Seq([1, 2, 3, 4, 5]).size).toBe(5);
    expect(Seq([1, 2, 3, 4, 5]).count()).toBe(5);
  });

  it('counts sequences with unknown lengths, resulting in a cached size', () => {
    const seq = Seq([1, 2, 3, 4, 5, 6]).filter((x) => x % 2 === 0);
    expect(seq.size).toBe(undefined);
    expect(seq.count()).toBe(3);
    expect(seq.size).toBe(3);
  });

  it('counts sequences with a specific predicate', () => {
    const seq = Seq([1, 2, 3, 4, 5, 6]);
    expect(seq.size).toBe(6);
    expect(seq.count((x) => x > 3)).toBe(3);
  });

  describe('countBy', () => {
    it('counts by keyed sequence', () => {
      const grouped = Seq({ a: 1, b: 2, c: 3, d: 4 }).countBy((x) => x % 2);
      expect(grouped.toJS()).toEqual({ 1: 2, 0: 2 });
      expect(grouped.get(1)).toEqual(2);
    });

    it('counts by indexed sequence', () => {
      expect(
        Seq([1, 2, 3, 4, 5, 6])
          .countBy((x) => x % 2)
          .toJS()
      ).toEqual({ 1: 3, 0: 3 });
    });

    it('counts by specific keys', () => {
      expect(
        Seq([1, 2, 3, 4, 5, 6])
          .countBy((x) => (x % 2 ? 'odd' : 'even'))
          .toJS()
      ).toEqual({ odd: 3, even: 3 });
    });

    it.each(kinds)('counts the values of a %s', (_kind, constructor) => {
      const counted = constructor(['a', 'bb', 'cc', 'd']).countBy(
        (v) => v.length
      );

      expect(counted.toJS()).toEqual({ 1: 2, 2: 2 });
    });

    it('counts the values of a keyed collection', () => {
      expect(
        Map({ a: 1, b: 2, c: 3, d: 4 })
          .countBy((v) => v % 2)
          .toJS()
      ).toEqual({ 0: 2, 1: 2 });
    });

    // Unlike `groupBy`, which mirrors the ordering of its source, `countBy`
    // always builds an unordered Map.
    it.each(orderedSources)(
      'returns an unordered Map even from a %s',
      (_kind, source) => {
        const counted = source.countBy((v) => v.length);

        expect(Map.isMap(counted)).toBe(true);
        expect(isOrdered(counted)).toBe(false);
      }
    );

    it('passes value, key and source collection to the grouper, bound to `context`', () => {
      const source = List(['a', 'bb']);
      const context = { tag: 'ctx' };
      const calls: Array<unknown> = [];

      source.countBy(function (this: unknown, v, k, iter) {
        calls.push([this === context, v, k, iter === source]);
        return v.length;
      }, context);

      expect(calls).toEqual([
        [true, 'a', 0, true],
        [true, 'bb', 1, true],
      ]);
    });
  });

  describe('isEmpty', () => {
    it('is O(1) on sequences with known lengths', () => {
      expect(Seq([1, 2, 3, 4, 5]).size).toBe(5);
      expect(Seq([1, 2, 3, 4, 5]).isEmpty()).toBe(false);
      expect(Seq().size).toBe(0);
      expect(Seq().isEmpty()).toBe(true);
    });

    it('lazily evaluates Seq with unknown length', () => {
      let seq = Seq([1, 2, 3, 4, 5, 6]).filter((x) => x % 2 === 0);
      expect(seq.size).toBe(undefined);
      expect(seq.isEmpty()).toBe(false);
      expect(seq.size).toBe(undefined);

      seq = Seq([1, 2, 3, 4, 5, 6]).filter((x) => x > 10);
      expect(seq.size).toBe(undefined);
      expect(seq.isEmpty()).toBe(true);
      expect(seq.size).toBe(undefined);
    });

    it('with infinitely long sequences of known length', () => {
      const seq = Range(0, Infinity);
      expect(seq.size).toBe(Infinity);
      expect(seq.isEmpty()).toBe(false);
    });

    it('with infinitely long sequences of unknown length', () => {
      const seq = Range(0, Infinity).filter((x) => x % 2 === 0);
      expect(seq.size).toBe(undefined);
      expect(seq.isEmpty()).toBe(false);
      expect(seq.size).toBe(undefined);
    });
  });
});
