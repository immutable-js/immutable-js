///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

jest.autoMockOff();

import I = require('immutable');

describe('groupBy', () => {

  it('groups keyed sequence', () => {
    var grouped = I.Seq({a:1,b:2,c:3,d:4}).groupBy(x => x % 2);
    expect(grouped.toJS()).toEqual({1:{a:1,c:3}, 0:{b:2,d:4}});

    // Each group should be a keyed sequence, not an indexed sequence
    expect(grouped.get(1).toArray()).toEqual([1, 3]);
  })

  it('groups indexed sequence', () => {
    expect(
      I.Seq.of(1,2,3,4,5,6).groupBy(x => x % 2).toJS()
    ).toEqual(
      {1:[1,3,5], 0:[2,4,6]}
    );
  })

  it('groups to keys', () => {
    expect(
      I.Seq.of(1,2,3,4,5,6).groupBy(x => x % 2 ? 'odd' : 'even').toJS()
    ).toEqual(
      {odd:[1,3,5], even:[2,4,6]}
    );
  })

  it('groups indexed sequences, maintaining indicies', () => {
    expect(
      I.Seq.of(1,2,3,4,5,6).toKeyedSeq().groupBy(x => x % 2).toJS()
    ).toEqual(
      {1:[1,,3,,5,,,], 0:[,2,,4,,6]}
    );
  })

  it('has groups that can be mapped', () => {
    expect(
      I.Seq.of(1,2,3,4,5,6).groupBy(x => x % 2).map(group => group.map(value => value * 10)).toJS()
    ).toEqual(
      {1:[10,30,50], 0:[20,40,60]}
    );
  })

  it('returns an ordered map from an ordered collection', () => {
    var seq = I.Seq.of('Z','Y','X','Z','Y','X');
    expect(I.Iterable.isOrdered(seq)).toBe(true);
    var seqGroups = seq.groupBy(x => x);
    expect(I.Iterable.isOrdered(seqGroups)).toBe(true);

    var map = I.Map({ x: 1, y: 2 });
    expect(I.Iterable.isOrdered(map)).toBe(false);
    var mapGroups = map.groupBy(x => x);
    expect(I.Iterable.isOrdered(mapGroups)).toBe(false);
  })

})
