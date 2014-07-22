///<reference path='../resources/jest.d.ts'/>
jest.autoMockOff();
import P = require('../dist/Immutable');

declare function expect(val: any): ExpectWithIs;

interface ExpectWithIs extends Expect {
  is(expected: any): void;
}

describe('slice', () => {

  beforeEach(function () {
    this.addMatchers({
      is: function(expected) {
        return P.is(this.actual, expected);
      }
    })
  })

  it('slices a sequence', () => {
    expect(P.Sequence(1,2,3,4,5,6).slice(2).toArray()).toEqual([3,4,5,6]);
    expect(P.Sequence(1,2,3,4,5,6).slice(2, 4).toArray()).toEqual([3,4]);
    expect(P.Sequence(1,2,3,4,5,6).slice(-3, -1).toArray()).toEqual([4,5]);
    expect(P.Sequence(1,2,3,4,5,6).slice(-1).toArray()).toEqual([6]);
    expect(P.Sequence(1,2,3,4,5,6).slice(0, -1).toArray()).toEqual([1,2,3,4,5]);
  })

  it('slices a sparse indexed sequence', () => {
    expect(P.Sequence([1,,2,,3,,4,,5,,6]).slice(1).toArray()).toEqual([,2,,3,,4,,5,,6]);
    expect(P.Sequence([1,,2,,3,,4,,5,,6]).slice(2).toArray()).toEqual([2,,3,,4,,5,,6]);
    expect(P.Sequence([1,,2,,3,,4,,5,,6]).slice(3, -3).toArray()).toEqual([,3,,4,,,]); // one trailing hole.
  })

  it('can maintain indices for an indexed sequence', () => {
    expect(P.Sequence(1,2,3,4,5,6).slice(2, null, true).toArray()).toEqual([,,3,4,5,6]);
    expect(P.Sequence(1,2,3,4,5,6).slice(2, 4, true).toArray()).toEqual([,,3,4,,,,]); // two trailing holes.
  })

  it.only('slices an unindexed sequence', () => {
    //expect(P.Sequence({a:1,b:2,c:3}).slice(1).toObject()).toEqual({b:2,c:3});
    //expect(P.Sequence({a:1,b:2,c:3}).slice(1, 2).toObject()).toEqual({b:2});
    //expect(P.Sequence({a:1,b:2,c:3}).slice(0, 2).toObject()).toEqual({a:1,b:2});
    expect(P.Sequence({a:1,b:2,c:3}).slice(-1).toObject()).toEqual({c:3});
    //expect(P.Sequence({a:1,b:2,c:3}).slice(1, -1).toObject()).toEqual({b:2});
  })

  it('is reversable', () => {
    expect(P.Sequence(1,2,3,4,5,6).slice(2).reverse().toArray()).toEqual([6,5,4,3]);
    expect(P.Sequence(1,2,3,4,5,6).slice(2, 4).reverse().toArray()).toEqual([4,3]);
    expect(P.Sequence(1,2,3,4,5,6).slice(2, null, true).reverse().toArray()).toEqual([6,5,4,3,,,,]); // two trailing holes.
    expect(P.Sequence(1,2,3,4,5,6).slice(2, 4, true).reverse().toArray()).toEqual([,,4,3,,,,]); // two trailing holes.
  })

  it('slices a vector', () => {
    expect(P.Vector(1,2,3,4,5,6).slice(2).toArray()).toEqual([3,4,5,6]);
    expect(P.Vector(1,2,3,4,5,6).slice(2, 4).toArray()).toEqual([3,4]);
  })

  it('returns self for whole slices', () => {
    var s = P.Sequence(1,2,3);
    expect(s.slice(0)).toBe(s);
    expect(s.slice(0, 3)).toBe(s);
    expect(s.slice(-4, 4)).toBe(s);

    var v = P.Vector(1,2,3);
    expect(v.slice(-4, 4)).toBe(v);
    expect(v.slice(-3)).toBe(v);
    expect(v.slice(-4, 4).toVector()).toBe(v);
  })

  it('creates a sliced vector in O(log32(n))', () => {
    expect(P.Vector(1,2,3,4,5).slice(-3, -1).toVector().toArray()).toBe([3,4]);
  })

})
