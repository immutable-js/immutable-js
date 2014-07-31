///<reference path='../resources/jest.d.ts'/>
jest.autoMockOff();
import I = require('../dist/Immutable');
import Sequence = I.Sequence;
import Vector = I.Vector;

describe('splice', () => {

  it('splices a sequence only removing elements', () => {
    expect(Sequence(1,2,3).splice(0,1).toArray()).toEqual([2,3]);
    expect(Sequence(1,2,3).splice(1,1).toArray()).toEqual([1,3]);
    expect(Sequence(1,2,3).splice(2,1).toArray()).toEqual([1,2]);
    expect(Sequence(1,2,3).splice(3,1).toArray()).toEqual([1,2,3]);
  })

  it('splices a vector only removing elements', () => {
    expect(Vector(1,2,3).splice(0,1).toArray()).toEqual([2,3]);
    expect(Vector(1,2,3).splice(1,1).toArray()).toEqual([1,3]);
    expect(Vector(1,2,3).splice(2,1).toArray()).toEqual([1,2]);
    expect(Vector(1,2,3).splice(3,1).toArray()).toEqual([1,2,3]);
  })

})
