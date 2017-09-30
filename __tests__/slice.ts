/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

jest.autoMockOff();

import * as jasmineCheck from 'jasmine-check';
jasmineCheck.install();

import { List, Range, Seq } from 'immutable';

describe('slice', () => {

  it('slices a sequence', () => {
    expect(Seq.of(1,2,3,4,5,6).slice(2).toArray()).toEqual([3,4,5,6]);
    expect(Seq.of(1,2,3,4,5,6).slice(2, 4).toArray()).toEqual([3,4]);
    expect(Seq.of(1,2,3,4,5,6).slice(-3, -1).toArray()).toEqual([4,5]);
    expect(Seq.of(1,2,3,4,5,6).slice(-1).toArray()).toEqual([6]);
    expect(Seq.of(1,2,3,4,5,6).slice(0, -1).toArray()).toEqual([1,2,3,4,5]);
  })

  it('creates an immutable stable sequence', () => {
    var seq = Seq.of(1,2,3,4,5,6);
    var sliced = seq.slice(2, -2);
    expect(sliced.toArray()).toEqual([3, 4]);
    expect(sliced.toArray()).toEqual([3, 4]);
    expect(sliced.toArray()).toEqual([3, 4]);
  })

  it('slices a sparse indexed sequence', () => {
    expect(Seq([1,,2,,3,,4,,5,,6]).slice(1).toArray()).toEqual([,2,,3,,4,,5,,6]);
    expect(Seq([1,,2,,3,,4,,5,,6]).slice(2).toArray()).toEqual([2,,3,,4,,5,,6]);
    expect(Seq([1,,2,,3,,4,,5,,6]).slice(3, -3).toArray()).toEqual([,3,,4,,]); // one trailing hole.
  })

  it('can maintain indices for an keyed indexed sequence', () => {
    expect(Seq.of(1,2,3,4,5,6).toKeyedSeq().slice(2).entrySeq().toArray()).toEqual([
      [2,3],
      [3,4],
      [4,5],
      [5,6],
    ]);
    expect(Seq.of(1,2,3,4,5,6).toKeyedSeq().slice(2, 4).entrySeq().toArray()).toEqual([
      [2,3],
      [3,4],
    ]);
  })

  it('slices an unindexed sequence', () => {
    expect(Seq({a:1,b:2,c:3}).slice(1).toObject()).toEqual({b:2,c:3});
    expect(Seq({a:1,b:2,c:3}).slice(1, 2).toObject()).toEqual({b:2});
    expect(Seq({a:1,b:2,c:3}).slice(0, 2).toObject()).toEqual({a:1,b:2});
    expect(Seq({a:1,b:2,c:3}).slice(-1).toObject()).toEqual({c:3});
    expect(Seq({a:1,b:2,c:3}).slice(1, -1).toObject()).toEqual({b:2});
  })

  it('is reversable', () => {
    expect(Seq.of(1,2,3,4,5,6).slice(2).reverse().toArray()).toEqual([6,5,4,3]);
    expect(Seq.of(1,2,3,4,5,6).slice(2, 4).reverse().toArray()).toEqual([4,3]);
    expect(Seq.of(1,2,3,4,5,6).toKeyedSeq().slice(2).reverse().entrySeq().toArray()).toEqual([
      [5,6],
      [4,5],
      [3,4],
      [2,3],
    ]);
    expect(Seq.of(1,2,3,4,5,6).toKeyedSeq().slice(2, 4).reverse().entrySeq().toArray()).toEqual([
      [3,4],
      [2,3],
    ]);
  })

  it('slices a list', () => {
    expect(List.of(1,2,3,4,5,6).slice(2).toArray()).toEqual([3,4,5,6]);
    expect(List.of(1,2,3,4,5,6).slice(2, 4).toArray()).toEqual([3,4]);
  })

  it('returns self for whole slices', () => {
    var s = Seq.of(1,2,3);
    expect(s.slice(0)).toBe(s);
    expect(s.slice(0, 3)).toBe(s);
    expect(s.slice(-4, 4)).toBe(s);

    var v = List.of(1,2,3);
    expect(v.slice(-4, 4)).toBe(v);
    expect(v.slice(-3)).toBe(v);
    expect(v.slice(-4, 4).toList()).toBe(v);
  })

  it('creates a sliced list in O(log32(n))', () => {
    expect(List.of(1,2,3,4,5).slice(-3, -1).toList().toArray()).toEqual([3,4]);
  })

  it('has the same behavior as array slice in known edge cases', () => {
    var a = Range(0, 33).toArray();
    var v = List(a);
    expect(v.slice(31).toList().toArray()).toEqual(a.slice(31));
  })

  it('does not slice by floating-point numbers', () => {
    var seq = Seq([0,1,2,3,4,5]);
    var sliced = seq.slice(0, 2.6);
    expect(sliced.size).toEqual(2);
    expect(sliced.toArray()).toEqual([0, 1]);
  })

  it('can create an iterator', () => {
    var seq = Seq([0,1,2,3,4,5]);
    var iterFront = seq.slice(0,2).values();
    expect(iterFront.next()).toEqual({value: 0, done: false});
    expect(iterFront.next()).toEqual({value: 1, done: false});
    expect(iterFront.next()).toEqual({value: undefined, done: true});

    var iterMiddle = seq.slice(2,4).values();
    expect(iterMiddle.next()).toEqual({value: 2, done: false});
    expect(iterMiddle.next()).toEqual({value: 3, done: false});
    expect(iterMiddle.next()).toEqual({value: undefined, done: true});

    var iterTail = seq.slice(4,123456).values();
    expect(iterTail.next()).toEqual({value: 4, done: false});
    expect(iterTail.next()).toEqual({value: 5, done: false});
    expect(iterTail.next()).toEqual({value: undefined, done: true});
  })

  check.it('works like Array.prototype.slice',
           [gen.int, gen.array(gen.oneOf([gen.int, gen.undefined]), 0, 3)],
           (valuesLen, args) => {
    var a = Range(0, valuesLen).toArray();
    var v = List(a);
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
    var s = Seq(a);
    var slicedS = s.slice.apply(s, args);
    var slicedA = a.slice.apply(a, args);
    expect(slicedS.toArray()).toEqual(slicedA);
  })

  describe('take', () => {

    check.it('takes the first n from a list', [gen.int, gen.posInt], (len, num) => {
      var a = Range(0, len).toArray();
      var v = List(a);
      expect(v.take(num).toArray()).toEqual(a.slice(0, num));
    })

    it('creates an immutable stable sequence', () => {
      var seq = Seq.of(1,2,3,4,5,6);
      var sliced = seq.take(3);
      expect(sliced.toArray()).toEqual([1, 2, 3]);
      expect(sliced.toArray()).toEqual([1, 2, 3]);
      expect(sliced.toArray()).toEqual([1, 2, 3]);
    })

    it('converts to array with correct length', () => {
      var seq = Seq.of(1,2,3,4,5,6);
      var s1 = seq.take(3);
      var s2 = seq.take(10);
      var sn = seq.take(Infinity);
      var s3 = seq.filter((v) => v < 4).take(10);
      var s4 = seq.filter((v) => v < 4).take(2);
      expect(s1.toArray().length).toEqual(3);
      expect(s2.toArray().length).toEqual(6);
      expect(sn.toArray().length).toEqual(6);
      expect(s3.toArray().length).toEqual(3);
      expect(s4.toArray().length).toEqual(2);
    })

  })

})
