///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

jest.autoMockOff();

import I = require('immutable');
import Seq = I.Seq;

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

  it('concats two sequences', () => {
    var a = Seq.of(1,2,3);
    var b = Seq.of(4,5,6);
    expect(a.concat(b)).is(Seq.of(1,2,3,4,5,6))
    expect(a.concat(b).size).toBe(6);
    expect(a.concat(b).toArray()).toEqual([1,2,3,4,5,6]);
  })

  it('concats two object sequences', () => {
    var a = Seq({a:1,b:2,c:3});
    var b = Seq({d:4,e:5,f:6});
    expect(a.size).toBe(3);
    expect(a.concat(b).size).toBe(6);
    expect(a.concat(b).toObject()).toEqual({a:1,b:2,c:3,d:4,e:5,f:6});
  })

  it('concats objects to keyed seq', () => {
    var a = Seq({a:1,b:2,c:3});
    var b = {d:4,e:5,f:6};
    expect(a.concat(b).toObject()).toEqual({a:1,b:2,c:3,d:4,e:5,f:6});
  })

  it('doesnt concat raw arrays to keyed seq', () => {
    var a = Seq({a:1,b:2,c:3});
    var b = [4,5,6];
    expect(() => {
      a.concat(b).toJS();
    }).toThrow('Expected [K, V] tuple: 4');
  })

  it('concats arrays to indexed seq', () => {
    var a = Seq.of(1,2,3);
    var b = [4,5,6];
    expect(a.concat(b).size).toBe(6);
    expect(a.concat(b).toObject()).toEqual([1,2,3,4,5,6]);
  })

  it('concats values', () => {
    var a = Seq.of(1,2,3);
    expect(a.concat(4,5,6).size).toBe(6);
    expect(a.concat(4,5,6).toObject()).toEqual([1,2,3,4,5,6]);
  })

  it('doesnt concat objects to indexed seq', () => {
    var a = Seq.of(0,1,2,3);
    var b = {4:4};
    var i = a.concat(b);
    expect(i.size).toBe(5);
    expect(i.get(4)).toBe(b);
    expect(i.toArray()).toEqual([0,1,2,3,{4:4}]);
  })

  it('concats multiple arguments', () => {
    var a = Seq.of(1,2,3);
    var b = [4,5,6];
    var c = [7,8,9];
    expect(a.concat(b, c).size).toBe(9);
    expect(a.concat(b, c).toObject()).toEqual([1,2,3,4,5,6,7,8,9]);
  })

  it('can concat itself!', () => {
    var a = Seq.of(1,2,3);
    expect(a.concat(a, a).size).toBe(9);
    expect(a.concat(a, a).toObject()).toEqual([1,2,3,1,2,3,1,2,3]);
  })

  it('returns itself when concat does nothing', () => {
    var a = Seq.of(1,2,3);
    var b = Seq();
    expect(a.concat()).toBe(a);
    expect(a.concat(b)).toBe(a);
    expect(b.concat(b)).toBe(b);
  })

  it('returns non-empty item when concat does nothing', () => {
    var a = Seq.of(1,2,3);
    var b = Seq();
    expect(a.concat(b)).toBe(a);
    expect(b.concat(a)).toBe(a);
    expect(b.concat(b, b, b, a, b, b)).toBe(a);
  })

  it('always returns the same type', () => {
    var a = I.Set.of(1,2,3);
    var b = I.List();
    expect(b.concat(a)).not.toBe(a);
    expect(I.List.isList(b.concat(a))).toBe(true);
    expect(b.concat(a)).is(I.List.of(1,2,3));
  })

  it('iterates repeated keys', () => {
    var a = Seq({a:1,b:2,c:3});
    expect(a.concat(a, a).toObject()).toEqual({a:1,b:2,c:3});
    expect(a.concat(a, a).toArray()).toEqual([1,2,3,1,2,3,1,2,3]);
    expect(a.concat(a, a).keySeq().toArray()).toEqual(['a','b','c','a','b','c','a','b','c']);
  })

  it('lazily reverses un-indexed sequences', () => {
    var a = Seq({a:1,b:2,c:3});
    var b = Seq({d:4,e:5,f:6});
    expect(a.concat(b).reverse().keySeq().toArray()).toEqual(['f','e','d','c','b','a']);
  })

  it('lazily reverses indexed sequences', () => {
    var a = Seq([1,2,3]);
    expect(a.concat(a, a).reverse().size).toBe(9);
    expect(a.concat(a, a).reverse().toArray()).toEqual([3,2,1,3,2,1,3,2,1]);
  })

  it('lazily reverses indexed sequences with unknown size, maintaining indicies', () => {
    var a = Seq([1,2,3]).filter(x=>true);
    expect(a.concat(a, a).toKeyedSeq().reverse().size).toBe(undefined);
    expect(a.concat(a, a).toKeyedSeq().reverse().entrySeq().toArray()).toEqual(
      [[8,3],[7,2],[6,1],[5,3],[4,2],[3,1],[2,3],[1,2],[0,1]]
    );
  })

  it('counts from the end of the indexed sequence on negative index', () => {
    var i = I.List.of(9, 5, 3, 1).map(x => - x);
    expect(i.get(0)).toBe(-9);
    expect(i.get(-1)).toBe(-1);
    expect(i.get(-4)).toBe(-9);
    expect(i.get(-5, 888)).toBe(888);
  })

})
