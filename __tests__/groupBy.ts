///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

import { Iterable, Seq, Map } from 'immutable';

describe('groupBy', () => {

  it('groups keyed sequence', () => {
    var grouped = Seq({a:1,b:2,c:3,d:4}).groupBy(x => x % 2);
    expect(grouped.toJS()).toEqual({1:{a:1,c:3}, 0:{b:2,d:4}});

    // Each group should be a keyed sequence, not an indexed sequence
    expect(grouped.get(1).toArray()).toEqual([1, 3]);
  })

  it('groups indexed sequence', () => {
    expect(
      Seq.of(1,2,3,4,5,6).groupBy(x => x % 2).toJS()
    ).toEqual(
      {1:[1,3,5], 0:[2,4,6]}
    );
  })

  it('groups to keys', () => {
    expect(
      Seq.of(1,2,3,4,5,6).groupBy(x => x % 2 ? 'odd' : 'even').toJS()
    ).toEqual(
      {odd:[1,3,5], even:[2,4,6]}
    );
  })

  it('groups indexed sequences, maintaining indicies when keyed sequences', () => {
    expect(
      Seq.of(1,2,3,4,5,6).groupBy(x => x % 2).toJS()
    ).toEqual(
      {1:[1,3,5], 0:[2,4,6]}
    );
    expect(
      Seq.of(1,2,3,4,5,6).toKeyedSeq().groupBy(x => x % 2).toJS()
    ).toEqual(
      {1:{0:1, 2:3, 4:5}, 0:{1:2, 3:4, 5:6}}
    );
  })

  it('has groups that can be mapped', () => {
    expect(
      Seq.of(1,2,3,4,5,6).groupBy(x => x % 2).map(group => group.map(value => value * 10)).toJS()
    ).toEqual(
      {1:[10,30,50], 0:[20,40,60]}
    );
  })

  it('returns an ordered map from an ordered collection', () => {
    var seq = Seq.of('Z','Y','X','Z','Y','X');
    expect(Iterable.isOrdered(seq)).toBe(true);
    var seqGroups = seq.groupBy(x => x);
    expect(Iterable.isOrdered(seqGroups)).toBe(true);

    var map = Map({ x: 1, y: 2 });
    expect(Iterable.isOrdered(map)).toBe(false);
    var mapGroups = map.groupBy(x => x);
    expect(Iterable.isOrdered(mapGroups)).toBe(false);
  })

})
