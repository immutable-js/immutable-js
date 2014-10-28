///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

jest.autoMockOff();

import jasmineCheck = require('jasmine-check');
jasmineCheck.install();

import I = require('immutable');
import Seq = I.Seq;
import List = I.List;

describe('splice', () => {

  it('splices a sequence only removing elements', () => {
    expect(Seq.of(1,2,3).splice(0,1).toArray()).toEqual([2,3]);
    expect(Seq.of(1,2,3).splice(1,1).toArray()).toEqual([1,3]);
    expect(Seq.of(1,2,3).splice(2,1).toArray()).toEqual([1,2]);
    expect(Seq.of(1,2,3).splice(3,1).toArray()).toEqual([1,2,3]);
  })

  it('splices a list only removing elements', () => {
    expect(List.of(1,2,3).splice(0,1).toArray()).toEqual([2,3]);
    expect(List.of(1,2,3).splice(1,1).toArray()).toEqual([1,3]);
    expect(List.of(1,2,3).splice(2,1).toArray()).toEqual([1,2]);
    expect(List.of(1,2,3).splice(3,1).toArray()).toEqual([1,2,3]);
  })

  it('has the same behavior as array splice in known edge cases', () => {
    // arbitary numbers that sum to 31
    var a = I.Range(0, 49).toArray();
    var v = List(a);
    a.splice(-18, 0, 0);
    expect(v.splice(-18, 0, 0).toList().toArray()).toEqual(a);
  })

  check.it('has the same behavior as array splice',
           [gen.array(gen.int), gen.array(gen.oneOf([gen.int, gen.undefined]))],
           (values, args) => {
    var v = List(values);
    var a = values.slice(); // clone
    var splicedV = v.splice.apply(v, args); // persistent
    a.splice.apply(a, args); // mutative
    expect(splicedV.toArray()).toEqual(a);
  })

})
