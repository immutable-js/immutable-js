///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/Immutable.d.ts'/>

jest.autoMockOff();

import jasmineCheck = require('jasmine-check');
jasmineCheck.install();

import I = require('immutable');
import Sequence = I.Sequence;
import Vector = I.Vector;

describe('slice', () => {

  it('slices a sequence', () => {
    expect(Sequence(1,2,3,4,5,6).slice(2).toArray()).toEqual([3,4,5,6]);
    expect(Sequence(1,2,3,4,5,6).slice(2, 4).toArray()).toEqual([3,4]);
    expect(Sequence(1,2,3,4,5,6).slice(-3, -1).toArray()).toEqual([4,5]);
    expect(Sequence(1,2,3,4,5,6).slice(-1).toArray()).toEqual([6]);
    expect(Sequence(1,2,3,4,5,6).slice(0, -1).toArray()).toEqual([1,2,3,4,5]);
  })

  it('creates an immutable stable sequence', () => {
    var seq = Sequence(1,2,3,4,5,6);
    var sliced = seq.slice(2, -2);
    expect(sliced.toArray()).toEqual([3, 4]);
    expect(sliced.toArray()).toEqual([3, 4]);
    expect(sliced.toArray()).toEqual([3, 4]);
  })

  it('slices a sparse indexed sequence', () => {
    expect(Sequence([1,,2,,3,,4,,5,,6]).slice(1).toArray()).toEqual([,2,,3,,4,,5,,6]);
    expect(Sequence([1,,2,,3,,4,,5,,6]).slice(2).toArray()).toEqual([2,,3,,4,,5,,6]);
    expect(Sequence([1,,2,,3,,4,,5,,6]).slice(3, -3).toArray()).toEqual([,3,,4,,,]); // one trailing hole.
  })

  it('can maintain indices for an keyed indexed sequence', () => {
    expect(Sequence(1,2,3,4,5,6).toKeyedSeq().slice(2).entrySeq().toArray()).toEqual([
      [2,3],
      [3,4],
      [4,5],
      [5,6],
    ]);
    expect(Sequence(1,2,3,4,5,6).toKeyedSeq().slice(2, 4).entrySeq().toArray()).toEqual([
      [2,3],
      [3,4],
    ]);
  })

  it('slices an unindexed sequence', () => {
    expect(Sequence({a:1,b:2,c:3}).slice(1).toObject()).toEqual({b:2,c:3});
    expect(Sequence({a:1,b:2,c:3}).slice(1, 2).toObject()).toEqual({b:2});
    expect(Sequence({a:1,b:2,c:3}).slice(0, 2).toObject()).toEqual({a:1,b:2});
    expect(Sequence({a:1,b:2,c:3}).slice(-1).toObject()).toEqual({c:3});
    expect(Sequence({a:1,b:2,c:3}).slice(1, -1).toObject()).toEqual({b:2});
  })

  it('is reversable', () => {
    expect(Sequence(1,2,3,4,5,6).slice(2).reverse().toArray()).toEqual([6,5,4,3]);
    expect(Sequence(1,2,3,4,5,6).slice(2, 4).reverse().toArray()).toEqual([4,3]);
    expect(Sequence(1,2,3,4,5,6).toKeyedSeq().slice(2).reverse().entrySeq().toArray()).toEqual([
      [5,6],
      [4,5],
      [3,4],
      [2,3],
    ]);
    expect(Sequence(1,2,3,4,5,6).toKeyedSeq().slice(2, 4).reverse().entrySeq().toArray()).toEqual([
      [3,4],
      [2,3],
    ]);
  })

  it('slices a vector', () => {
    expect(Vector(1,2,3,4,5,6).slice(2).toArray()).toEqual([3,4,5,6]);
    expect(Vector(1,2,3,4,5,6).slice(2, 4).toArray()).toEqual([3,4]);
  })

  it('returns self for whole slices', () => {
    var s = Sequence(1,2,3);
    expect(s.slice(0)).toBe(s);
    expect(s.slice(0, 3)).toBe(s);
    expect(s.slice(-4, 4)).toBe(s);

    var v = Vector(1,2,3);
    expect(v.slice(-4, 4)).toBe(v);
    expect(v.slice(-3)).toBe(v);
    expect(v.slice(-4, 4).toVector()).toBe(v);
  })

  it('creates a sliced vector in O(log32(n))', () => {
    expect(Vector(1,2,3,4,5).slice(-3, -1).toVector().toArray()).toEqual([3,4]);
  })

  check.it('works like Array.prototype.slice',
           [gen.int, gen.array(gen.oneOf([gen.int, gen.undefined]), 0, 3)],
           (valuesLen, args) => {
    var a = I.Range(0, valuesLen).toArray();
    var v = Vector.from(a);
    var slicedV = v.slice.apply(v, args);
    var slicedA = a.slice.apply(a, args);
    expect(slicedV.toArray()).toEqual(slicedA);
  })

  check.it('works like Array.prototype.slice on sparse array input',
           [gen.array(gen.array([gen.posInt, gen.int])),
            gen.array(gen.oneOf([gen.int, gen.undefined]), 0, 3)],
           (entries, args) => {
    var a = [];
    entries.forEach(entry => a[entry[0]] = entry[1]);
    var s = Sequence(a);
    var slicedS = s.slice.apply(s, args);
    var slicedA = a.slice.apply(a, args);
    expect(slicedS.toArray()).toEqual(slicedA);
  })

  describe('take', () => {

    check.it('takes the first n from a list', [gen.int, gen.posInt], (len, num) => {
      var a = I.Range(0, len).toArray();
      var v = Vector.from(a);
      expect(v.take(num).toArray()).toEqual(a.slice(0, num));
    })

    it('creates an immutable stable sequence', () => {
      var seq = Sequence(1,2,3,4,5,6);
      var sliced = seq.take(3);
      expect(sliced.toArray()).toEqual([1, 2, 3]);
      expect(sliced.toArray()).toEqual([1, 2, 3]);
      expect(sliced.toArray()).toEqual([1, 2, 3]);
    })

  })

})
