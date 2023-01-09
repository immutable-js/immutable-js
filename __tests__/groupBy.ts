import { Collection, Map, Seq, isOrdered, OrderedMap } from 'immutable';

describe('groupBy', () => {
  it('groups keyed sequence', () => {
    const grouped = Seq({ a: 1, b: 2, c: 3, d: 4 }).groupBy(x => x % 2);
    expect(grouped.toJS()).toEqual({ 1: { a: 1, c: 3 }, 0: { b: 2, d: 4 } });

    // Each group should be a keyed sequence, not an indexed sequence
    const firstGroup = grouped.get(1);
    expect(firstGroup && firstGroup.toArray()).toEqual([
      ['a', 1],
      ['c', 3],
    ]);
  });

  it('groups indexed sequence', () => {
    const group = Seq([1, 2, 3, 4, 5, 6]).groupBy(x => x % 2);

    expect(group).toBeInstanceOf(Map);
    expect(group.toJS()).toEqual({ 1: [1, 3, 5], 0: [2, 4, 6] });
  });

  it('groups to keys', () => {
    const group = Seq([1, 2, 3, 4, 5, 6]).groupBy(x =>
      x % 2 ? 'odd' : 'even'
    );
    expect(group).toBeInstanceOf(Map);
    expect(group.toJS()).toEqual({ odd: [1, 3, 5], even: [2, 4, 6] });
  });

  it('groups indexed sequences, maintaining indicies when keyed sequences', () => {
    const group = Seq([1, 2, 3, 4, 5, 6]).groupBy(x => x % 2);

    expect(group).toBeInstanceOf(Map);
    expect(group.toJS()).toEqual({ 1: [1, 3, 5], 0: [2, 4, 6] });

    const keyedGroup = Seq([1, 2, 3, 4, 5, 6])
      .toKeyedSeq()
      .groupBy(x => x % 2);

    expect(keyedGroup).toBeInstanceOf(Map);
    expect(keyedGroup.toJS()).toEqual({
      1: { 0: 1, 2: 3, 4: 5 },
      0: { 1: 2, 3: 4, 5: 6 },
    });
  });

  it('has groups that can be mapped', () => {
    const mappedGroup = Seq([1, 2, 3, 4, 5, 6])
      .groupBy(x => x % 2)
      .map(group => group.map(value => value * 10));

    expect(mappedGroup).toBeInstanceOf(Map);
    expect(mappedGroup.toJS()).toEqual({ 1: [10, 30, 50], 0: [20, 40, 60] });
  });

  it('returns an ordered map from an ordered collection', () => {
    const seq = Seq(['Z', 'Y', 'X', 'Z', 'Y', 'X']);
    expect(isOrdered(seq)).toBe(true);
    const seqGroups = seq.groupBy(x => x);
    expect(seqGroups).toBeInstanceOf(OrderedMap);
    expect(isOrdered(seqGroups)).toBe(true);

    const map = Map({ x: 1, y: 2 });
    expect(isOrdered(map)).toBe(false);
    const mapGroups = map.groupBy(x => x);
    expect(mapGroups).not.toBeInstanceOf(OrderedMap);
    expect(mapGroups).toBeInstanceOf(Map);
    expect(isOrdered(mapGroups)).toBe(false);
  });
});
