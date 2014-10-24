///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

jest.autoMockOff();

import I = require('immutable');
import LazySequence = I.LazySequence;

declare function expect(val: any): ExpectWithIs;

interface ExpectWithIs extends Expect {
  is(expected: any): void;
  not: ExpectWithIs;
}

describe('concat', () => {

  beforeEach(function () {
    this.addMatchers({
      is: function(expected) {
        return I.is(this.actual, expected);
      }
    })
  })

  it.only('concats two sequences', () => {
    var a = LazySequence.of(1,2,3);
    var b = LazySequence.of(4,5,6);
    expect(a.concat(b)).is(LazySequence.of(1,2,3,4,5,6))
    expect(a.concat(b).size).toBe(6);
    expect(a.concat(b).toArray()).toEqual([1,2,3,4,5,6]);
  })

  it('concats two object sequences', () => {
    var a = LazySequence({a:1,b:2,c:3});
    var b = LazySequence({d:4,e:5,f:6});
    expect(a.size).toBe(3);
    expect(a.concat(b).size).toBe(6);
    expect(a.concat(b).toObject()).toEqual({a:1,b:2,c:3,d:4,e:5,f:6});
  })

  it('concats objects', () => {
    var a = LazySequence({a:1,b:2,c:3});
    var b = {d:4,e:5,f:6};
    expect(a.concat(b).toObject()).toEqual({a:1,b:2,c:3,d:4,e:5,f:6});
  })

  it('concats arrays', () => {
    var a = LazySequence.of(1,2,3);
    var b = [4,5,6];
    expect(a.concat(b).size).toBe(6);
    expect(a.concat(b).toObject()).toEqual([1,2,3,4,5,6]);
  })

  it('concats values', () => {
    var a = LazySequence.of(1,2,3);
    expect(a.concat(4,5,6).size).toBe(6);
    expect(a.concat(4,5,6).toObject()).toEqual([1,2,3,4,5,6]);
  })

  it('concats multiple arguments', () => {
    var a = LazySequence.of(1,2,3);
    var b = [4,5,6];
    var c = [7,8,9];
    expect(a.concat(b, c).size).toBe(9);
    expect(a.concat(b, c).toObject()).toEqual([1,2,3,4,5,6,7,8,9]);
  })

  it('can concat itself!', () => {
    var a = LazySequence.of(1,2,3);
    expect(a.concat(a, a).size).toBe(9);
    expect(a.concat(a, a).toObject()).toEqual([1,2,3,1,2,3,1,2,3]);
  })

  it('iterates repeated keys', () => {
    var a = LazySequence({a:1,b:2,c:3});
    expect(a.concat(a, a).toObject()).toEqual({a:1,b:2,c:3});
    expect(a.concat(a, a).toArray()).toEqual([1,2,3,1,2,3,1,2,3]);
    expect(a.concat(a, a).keySeq().toArray()).toEqual(['a','b','c','a','b','c','a','b','c']);
  })

  it('lazily reverses un-indexed sequences', () => {
    var a = LazySequence({a:1,b:2,c:3});
    var b = LazySequence({d:4,e:5,f:6});
    expect(a.concat(b).reverse().keySeq().toArray()).toEqual(['f','e','d','c','b','a']);
  })

  it('lazily reverses indexed sequences', () => {
    var a = LazySequence([1,2,3]);
    expect(a.concat(a, a).reverse().size).toBe(9);
    expect(a.concat(a, a).reverse().toArray()).toEqual([3,2,1,3,2,1,3,2,1]);
  })

  it('lazily reverses indexed sequences with unknown size, maintaining indicies', () => {
    var a = LazySequence([1,2,3]).filter(x=>true);
    expect(a.concat(a, a).toKeyedSeq().reverse().size).toBe(undefined);
    expect(a.concat(a, a).toKeyedSeq().reverse().entrySeq().toArray()).toEqual(
      [[8,3],[7,2],[6,1],[5,3],[4,2],[3,1],[2,3],[1,2],[0,1]]
    );
  })

  it('counts from the end of the indexed sequence on negative index', () => {
    var i = I.Vector.of(9, 5, 3, 1).map(x => - x);
    expect(i.get(0)).toBe(-9);
    expect(i.get(-1)).toBe(-1);
    expect(i.get(-4)).toBe(-9);
    expect(i.get(-5, 888)).toBe(888);
  })

})
