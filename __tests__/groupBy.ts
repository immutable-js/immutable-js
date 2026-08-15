import {
  Collection,
  List,
  Map,
  OrderedMap,
  OrderedSet,
  Seq,
  Set,
  Stack,
  isOrdered,
} from 'immutable';
import { describe, expect, it } from '@jest/globals';

type StringCollectionFactory = (
  values: Array<string>
) => Collection<unknown, string>;

const kinds: Array<
  [
    kind: string,
    constructor: StringCollectionFactory,
    isKind: (v: unknown) => boolean,
  ]
> = [
  ['List', List, List.isList],
  ['Set', Set, Set.isSet],
  ['OrderedSet', OrderedSet, OrderedSet.isOrderedSet],
  ['Stack', Stack, Stack.isStack],
  ['Seq', Seq, Seq.isSeq],
];

describe('groupBy', () => {
  it.each`
    constructor   | constructorIsOrdered | isObject
    ${Collection} | ${true}              | ${false}
    ${List}       | ${true}              | ${false}
    ${Seq}        | ${true}              | ${false}
    ${Set}        | ${false}             | ${false}
    ${Stack}      | ${true}              | ${false}
    ${OrderedSet} | ${true}              | ${false}
    ${Map}        | ${false}             | ${true}
    ${OrderedMap} | ${true}              | ${true}
  `(
    'groupBy returns ordered or unordered of the base type is ordered or not: $constructor.name',
    ({ constructor, constructorIsOrdered, isObject }) => {
      const iterableConstructor = ['a', 'b', 'a', 'c'];
      const objectConstructor = { a: 1, b: 2, c: 3, d: 1 };

      const col = constructor(
        isObject ? objectConstructor : iterableConstructor
      );

      const grouped = col.groupBy((v: unknown) => v);

      // all groupBy should be instance of Map
      expect(Map.isMap(grouped)).toBe(true);

      // ordered objects should be instance of OrderedMap
      expect(isOrdered(col)).toBe(constructorIsOrdered);
      expect(isOrdered(grouped)).toBe(constructorIsOrdered);
      if (constructorIsOrdered) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(OrderedMap.isOrderedMap(grouped)).toBe(true);
      } else {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(OrderedMap.isOrderedMap(grouped)).toBe(false);
      }
    }
  );

  it.each(kinds)(
    'rebuilds every group as a %s, like the source',
    (_kind, constructor, isKind) => {
      const grouped = constructor(['a', 'bb', 'cc', 'd']).groupBy(
        (v) => v.length
      );

      expect(grouped.every((group) => isKind(group))).toBe(true);
    }
  );

  it('rebuilds the groups of a keyed collection as keyed collections', () => {
    const grouped = Map({ a: 1, b: 2, c: 3 }).groupBy((v) => v % 2);

    expect(grouped.every((group) => Map.isMap(group))).toBe(true);
    expect(grouped.get(1)?.toJS()).toEqual({ a: 1, c: 3 });
  });

  it('passes value, key and source collection to the grouper, bound to `context`', () => {
    const source = List(['a', 'bb']);
    const context = { tag: 'ctx' };
    const calls: Array<unknown> = [];

    source.groupBy(function (this: unknown, v, k, iter) {
      calls.push([this === context, v, k, iter === source]);
      return v.length;
    }, context);

    expect(calls).toEqual([
      [true, 'a', 0, true],
      [true, 'bb', 1, true],
    ]);
  });

  it('groups keyed sequence', () => {
    const grouped = Seq({ a: 1, b: 2, c: 3, d: 4 }).groupBy((x) => x % 2);
    expect(grouped.toJS()).toEqual({ 1: { a: 1, c: 3 }, 0: { b: 2, d: 4 } });

    // Each group should be a keyed sequence, not an indexed sequence
    const firstGroup = grouped.get(1);
    expect(firstGroup && firstGroup.toArray()).toEqual([
      ['a', 1],
      ['c', 3],
    ]);
  });

  it('groups indexed sequence', () => {
    const group = Seq([1, 2, 3, 4, 5, 6]).groupBy((x) => x % 2);

    expect(group.toJS()).toEqual({ 1: [1, 3, 5], 0: [2, 4, 6] });
  });

  it('groups to keys', () => {
    const group = Seq([1, 2, 3, 4, 5, 6]).groupBy((x) =>
      x % 2 ? 'odd' : 'even'
    );
    expect(group.toJS()).toEqual({ odd: [1, 3, 5], even: [2, 4, 6] });
  });

  it('allows `undefined` as a key', () => {
    const group = Seq([1, 2, 3, 4, 5, 6]).groupBy((x) =>
      x % 2 ? undefined : 'even'
    );
    expect(group.toJS()).toEqual({ undefined: [1, 3, 5], even: [2, 4, 6] });
  });

  it('groups indexed sequences, maintaining indicies when keyed sequences', () => {
    const group = Seq([1, 2, 3, 4, 5, 6]).groupBy((x) => x % 2);

    expect(group.toJS()).toEqual({ 1: [1, 3, 5], 0: [2, 4, 6] });

    const keyedGroup = Seq([1, 2, 3, 4, 5, 6])
      .toKeyedSeq()
      .groupBy((x) => x % 2);

    expect(keyedGroup.toJS()).toEqual({
      1: { 0: 1, 2: 3, 4: 5 },
      0: { 1: 2, 3: 4, 5: 6 },
    });
  });

  it('has groups that can be mapped', () => {
    const mappedGroup = Seq([1, 2, 3, 4, 5, 6])
      .groupBy((x) => x % 2)
      .map((group) => group.map((value) => value * 10));

    expect(mappedGroup.toJS()).toEqual({ 1: [10, 30, 50], 0: [20, 40, 60] });
  });
});
