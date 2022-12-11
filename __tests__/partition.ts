import { Collection, Map, Seq } from 'immutable';

describe('partition', () => {
  it('partitions keyed sequence', () => {
    const grouped = Seq({ a: 1, b: 2, c: 3, d: 4 }).partition(x => x % 2);
    expect(grouped.map(part => part.toJS())).toEqual([
      { b: 2, d: 4 },
      { a: 1, c: 3 },
    ]);

    // Each group should be a keyed sequence, not an indexed sequence
    const firstGroup = grouped[0];
    expect(firstGroup && firstGroup.toArray()).toEqual([
      ['a', 1],
      ['c', 3],
    ]);
  });

  it('partitions indexed sequence', () => {
    expect(
      Seq([1, 2, 3, 4, 5, 6])
        .partition(x => x % 2).map(part => part.toJS())

    ).toEqual([
      [2, 4, 6],
      [1, 3, 5],
    ]);
  });

  it('partitions indexed sequences, maintaining indicies when keyed sequences', () => {
    expect(
      Seq([1, 2, 3, 4, 5, 6])
        .partition(x => x % 2).map(part => part
          .toJS())
    ).toEqual([
      [2, 4, 6],
      [1, 3, 5],
    ]);
    expect(
      Seq([1, 2, 3, 4, 5, 6])
        .toKeyedSeq()
        .partition(x => x % 2).map(part => part
          .toJS())
    ).toEqual([
      { 1: 2, 3: 4, 5: 6 },
      { 0: 1, 2: 3, 4: 5 },
    ]);
  });
});
