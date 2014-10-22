///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

jest.autoMockOff();

import I = require('immutable');

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
    expect(
      m.updateIn(['a', 'b', 'c'], value => value * 2).toJS()
    ).toEqual(
      {a: {b: {c: 20}}}
    );
  })

  it('deep remove', () => {
    var m = I.fromJS({a: {b: {c: 10}}});
    expect(
      m.updateIn(['a', 'b'], map => map.remove('c')).toJS()
    ).toEqual(
      {a: {b: {}}}
    );
  })

  it('deep set', () => {
    var m = I.fromJS({a: {b: {c: 10}}});
    expect(
      m.updateIn(['a', 'b'], map => map.set('d', 20)).toJS()
    ).toEqual(
      {a: {b: {c: 10, d: 20}}}
    );
  })

  it('deep push', () => {
    var m = I.fromJS({a: {b: [1,2,3]}});
    expect(
      m.updateIn(['a', 'b'], vect => vect.push(4)).toJS()
    ).toEqual(
      {a: {b: [1,2,3,4]}}
    );
  })

  it('deep map', () => {
    var m = I.fromJS({a: {b: [1,2,3]}});
    expect(
      m.updateIn(['a', 'b'], vect => vect.map(value => value * 10)).toJS()
    ).toEqual(
      {a: {b: [10, 20, 30]}}
    );
  })

  it('creates new maps if path contains gaps', () => {
    var m = I.fromJS({a: {b: {c: 10}}});
    expect(
      m.updateIn(['a', 'z'], I.Map.empty(), map => map.set('d', 20)).toJS()
    ).toEqual(
      {a: {b: {c: 10}, z: {d: 20}}}
    );
  })

  it('throws if path cannot be set', () => {
    var m = I.fromJS({a: {b: {c: 10}}});
    expect(() => {
      m.updateIn(['a', 'b', 'c', 'd'], v => 20).toJS()
    }).toThrow();
  })

  it('updates self for empty path', () => {
    var m = I.fromJS({a: 1, b: 2, c: 3});
    expect(
      m.updateIn([], map => map.set('b', 20)).toJS()
    ).toEqual(
      {a: 1, b: 20, c: 3}
    )
  })

  it('performs edit when notSetValue is what you return from updater', () => {
    var m = I.Map();

    m = m.updateIn(['a', 'b', 'c'], I.Set.empty(), id => id);

    expect(m.size).toBe(1);

    expect(m.getIn(['a', 'b', 'c'])).toBe(I.Set.empty());
  })

  it('does not perform edit when new value is the same as old value', () => {
    var m = I.Map();

    m = m.updateIn(['a', 'b', 'c'], I.Set.empty(), id => undefined);

    expect(m.size).toBe(0);

    var nothing = {}; // sentinel.
    expect(m.getIn(['a', 'b', 'c'], nothing)).toBe(nothing);
  })

  describe('setIn', () => {

    it('provides shorthand for updateIn to set a single value', () => {
      var m = I.Map().setIn(['a','b','c'], 'X');
      expect(m.toJS()).toEqual({a:{b:{c:'X'}}});
    })

  })

  describe('removeIn', () => {

    it('provides shorthand for updateIn to remove a single value', () => {
      var m = I.fromJS({a:{b:{c:'X', d:'Y'}}});
      expect(m.removeIn(['a','b','c']).toJS()).toEqual({a:{b:{d:'Y'}}});
    })

    it('does not create empty maps for an unset path', () => {
      var m = I.Map();
      expect(m.removeIn(['a','b','c']).toJS()).toEqual({});
    })

  })

})
