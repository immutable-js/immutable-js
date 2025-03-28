import { describe, expect, it } from '@jest/globals';
import {
  Collection,
  Map,
  Seq,
  isOrdered,
  OrderedMap,
  List,
  OrderedSet,
  Set,
  Stack,
} from 'immutable';

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

      const grouped = col.groupBy((v) => v);

      // all groupBy should be instance of Map
      expect(grouped).toBeInstanceOf(Map);

      // ordered objects should be instance of OrderedMap
      expect(isOrdered(col)).toBe(constructorIsOrdered);
      expect(isOrdered(grouped)).toBe(constructorIsOrdered);
      if (constructorIsOrdered) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(grouped).toBeInstanceOf(OrderedMap);
      } else {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(grouped).not.toBeInstanceOf(OrderedMap);
      }
    }
  );

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
