///<reference path='../resources/jest.d.ts'/>
jest.autoMockOff();
import I = require('../dist/Immutable');

describe('groupBy', () => {

  it('groups keyed sequence', () => {
    expect(
      I.Sequence({a:1,b:2,c:3,d:4}).groupBy(x => x % 2).toJSON()
    ).toEqual(
      {1:{a:1,c:3}, 0:{b:2,d:4}}
    );
  })

  it('groups indexed sequence', () => {
    expect(
      I.Sequence(1,2,3,4,5,6).groupBy(x => x % 2).toJSON()
    ).toEqual(
      {1:[1,3,5], 0:[2,4,6]}
    );
  })

  it('groups to keys', () => {
    expect(
      I.Sequence(1,2,3,4,5,6).groupBy(x => x % 2 ? 'odd' : 'even').toJSON()
    ).toEqual(
      {odd:[1,3,5], even:[2,4,6]}
    );
  })

  it('groups indexed sequences, maintaining indicies', () => {
    expect(
      I.Sequence(1,2,3,4,5,6).groupBy(x => x % 2, null, true).toJSON()
    ).toEqual(
      {1:[1,,3,,5,,,], 0:[,2,,4,,6]}
    );
  })

  it('has groups that can be mapped', () => {
    expect(
      I.Sequence(1,2,3,4,5,6).groupBy(x => x % 2).map(group => group.map(value => value * 10)).toJSON()
    ).toEqual(
      {1:[10,30,50], 0:[20,40,60]}
    );
  })

})
