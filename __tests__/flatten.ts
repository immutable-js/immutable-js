///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/Immutable.d.ts'/>

jest.autoMockOff();

import I = require('immutable');

import jasmineCheck = require('jasmine-check');
jasmineCheck.install();

describe('flatten', () => {

  it('flattens sequences one level deep', () => {
    var nested = I.fromJS([[1,2],[3,4],[5,6]]);
    var flat = nested.flatten();
    expect(flat.toJS()).toEqual([1,2,3,4,5,6]);
  })

  it('returns an indexed sequence', () => {
    var nested = I.fromJS([[1],2,3,[4,5,6]]);
    var flat = nested.flatten();
    expect(flat.toString()).toEqual("Seq [ 1, 2, 3, 4, 5, 6 ]");
  })

  it('gives the correct iteration count', () => {
    var nested = I.fromJS([[1,2,3],[4,5,6]]);
    var flat = nested.flatten();
    expect(flat.forEach(x => x < 4)).toEqual(4);
  })

  it('flattens anything sequenceable', () => {
    var nested = I.Sequence(I.Range(1,3),[3,4],I.Vector(5,6,7),8);
    var flat = nested.flatten();
    expect(flat.toJS()).toEqual([1,2,3,4,5,6,7,8]);
  })

  it('can be reversed', () => {
    var nested = I.Sequence(I.Range(1,3),[3,4],I.Vector(5,6,7),8);
    var flat = nested.flatten();
    var reversed = flat.reverse();
    expect(reversed.toJS()).toEqual([8,7,6,5,4,3,2,1]);
  })

  describe('flatMap', () => {

    it('first maps, then flattens', () => {
      var numbers = I.Range(97, 100);
      var letters = numbers.flatMap(v => [
        String.fromCharCode(v),
        String.fromCharCode(v).toUpperCase(),
      ]);
      expect(letters.toJS()).toEqual(
        ['a','A','b','B','c','C']
      )
    })

  })

})

