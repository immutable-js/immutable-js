///<reference path='../resources/jest.d.ts'/>
jest.autoMockOff();
import Immutable = require('../dist/Immutable');
import Range = Immutable.Range;

describe('Range', () => {

  it('fixed range', () => {
    var v = Range(0, 3);
    expect(v.length).toBe(3);
    expect(v.first()).toBe(0);
    expect(v.last()).toBe(2);
    expect(v.toArray()).toEqual([0,1,2]);
  });

  it('stepped range', () => {
    var v = Range(1, 10, 3);
    expect(v.length).toBe(3);
    expect(v.first()).toBe(1);
    expect(v.last()).toBe(7);
    expect(v.toArray()).toEqual([1,4,7]);
  });

  it('open range', () => {
    var v = Range(10);
    expect(v.length).toBe(Infinity);
    expect(v.first()).toBe(10);
    expect(v.last()).toBe(Infinity);
    expect(() => v.toArray()).toThrow('Cannot access end of infinite range.');
  });

  it('infinitely repeated range', () => {
    var v = Range(10, 10, 0);
    expect(v.length).toBe(Infinity);
    expect(v.first()).toBe(10);
    expect(v.last()).toBe(10);
    expect(() => v.toArray()).toThrow('Cannot access end of infinite range.');
  });

  it('backwards range', () => {
    var v = Range(10, 1, 3);
    expect(v.length).toBe(3);
    expect(v.first()).toBe(10);
    expect(v.last()).toBe(4);
    expect(v.toArray()).toEqual([10,7,4]);
  });

  it('empty range', () => {
    var v = Range(10, 10);
    expect(v.length).toBe(0);
    expect(v.first()).toBe(undefined);
    expect(v.last()).toBe(undefined);
    expect(v.toArray()).toEqual([]);
  });

  it('slices range', () => {
    var v = Range(1, 11, 2);
    var s = v.slice(1, -2);
    expect(s.length).toBe(2);
    expect(s.toArray()).toEqual([3,5]);
  });

  it('stepped range does not land on end', () => {
    var v = Range(0, 7, 2);
    expect(v.length).toBe(4);
    expect(v.toArray()).toEqual([0,2,4,6]);
  });

  it('can be float', () => {
    var v = Range(0.5, 2.5, 0.5);
    expect(v.length).toBe(4);
    expect(v.toArray()).toEqual([0.5, 1, 1.5, 2]);
  });

  it('can be negative', () => {
    var v = Range(10, -10, 5);
    expect(v.length).toBe(4);
    expect(v.toArray()).toEqual([10,5,0,-5]);
  });

  it('can get from any index in O(1)', () => {
    var v = Range(0, Infinity, 8);
    expect(v.get(111)).toBe(888);
  });

  it('can find an index in O(1)', () => {
    var v = Range(0, Infinity, 8);
    expect(v.indexOf(888)).toBe(111);
  });

  it('maps values', () => {
    var r = Range(0, 4).map(v => v * v);
    expect(r.toArray()).toEqual([0,1,4,9]);
  });

  it('filters values', () => {
    var r = Range(0, 10).filter(v => v % 2 == 0);
    expect(r.toArray()).toEqual([0,2,4,6,8]);
  });

  it('reduces values', () => {
    var v = Range(0, 10, 2);

    var r = v.reduce<number>((a, b) => a + b, 0);

    expect(r).toEqual(20);
  });

  it('takes and skips values', () => {
    var v = Range(0, 100, 3)

    var r = v.skip(2).take(2);

    expect(r.toArray()).toEqual([6, 9]);
  });

  it('efficiently chains array methods', () => {
    var v = Range(1, Infinity);

    var r = v
      .filter(x => x % 2 == 0)
      .skip(2)
      .map<number>(x => x * x)
      .take(3)
      .reduce<number>((a, b) => a + b, 0);

    expect(r).toEqual(200);
  });

});
