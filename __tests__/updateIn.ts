///<reference path='../resources/jest.d.ts'/>
jest.autoMockOff();
import I = require('../dist/Immutable');

describe('updateIn', () => {

  it('deep get', () => {
    var m = I.fromJS({a: {b: {c: 10}}});
    expect(m.getIn(['a', 'b', 'c'])).toEqual(10);
  })

  it('deep get returns not found if path does not match', () => {
    var m = I.fromJS({a: {b: {c: 10}}});
    expect(m.getIn(['a', 'b', 'z'])).toEqual(undefined);
    expect(m.getIn(['a', 'b', 'c', 'd'])).toEqual(undefined);
  })

  it('deep edit', () => {
    var m = I.fromJS({a: {b: {c: 10}}});
    expect(I.toJS(
      m.updateIn(['a', 'b', 'c'], value => value * 2)
    )).toEqual(
      {a: {b: {c: 20}}}
    );
  })

  it('deep delete', () => {
    var m = I.fromJS({a: {b: {c: 10}}});
    expect(I.toJS(
      m.updateIn(['a', 'b'], map => map.delete('c'))
    )).toEqual(
      {a: {b: {}}}
    );
  })

  it('deep set', () => {
    var m = I.fromJS({a: {b: {c: 10}}});
    expect(I.toJS(
      m.updateIn(['a', 'b'], map => map.set('d', 20))
    )).toEqual(
      {a: {b: {c: 10, d: 20}}}
    );
  })

  it('deep push', () => {
    var m = I.fromJS({a: {b: [1,2,3]}});
    expect(I.toJS(
      m.updateIn(['a', 'b'], vect => vect.push(4))
    )).toEqual(
      {a: {b: [1,2,3,4]}}
    );
  })

  it('deep map', () => {
    var m = I.fromJS({a: {b: [1,2,3]}});
    expect(I.toJS(
      m.updateIn(['a', 'b'], vect => vect.map(value => value * 10))
    )).toEqual(
      {a: {b: [10, 20, 30]}}
    );
  })

  it('deep update does nothing if path does not match', () => {
    var m = I.fromJS({a: {b: {c: 10}}});
    expect(I.toJS(
      m.updateIn(['a', 'z'], map => map.set('d', 20))
    )).toEqual(
      {a: {b: {c: 10}}}
    );
    expect(I.toJS(
      m.updateIn(['a', 'b', 'c', 'd'], map => map.set('d', 20))
    )).toEqual(
      {a: {b: {c: 10}}}
    );
  })

})
