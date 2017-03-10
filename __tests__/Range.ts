import * as jasmineCheck from 'jasmine-check';
import { Range } from '../';
jasmineCheck.install();

describe('Range', () => {
  it('fixed range', () => {
    let v = Range(0, 3);
    expect(v.size).toBe(3);
    expect(v.first()).toBe(0);
    expect(v.rest().toArray()).toEqual([1, 2]);
    expect(v.last()).toBe(2);
    expect(v.butLast().toArray()).toEqual([0, 1]);
    expect(v.toArray()).toEqual([0, 1, 2]);
  });

  it('stepped range', () => {
    let v = Range(1, 10, 3);
    expect(v.size).toBe(3);
    expect(v.first()).toBe(1);
    expect(v.rest().toArray()).toEqual([4, 7]);
    expect(v.last()).toBe(7);
    expect(v.butLast().toArray()).toEqual([1, 4]);
    expect(v.toArray()).toEqual([1, 4, 7]);
  });

  it('open range', () => {
    let v = Range(10);
    expect(v.size).toBe(Infinity);
    expect(v.first()).toBe(10);
    expect(v.rest().first()).toBe(11);
    expect(v.last()).toBe(Infinity);
    expect(v.butLast().first()).toBe(10);
    expect(v.butLast().last()).toBe(Infinity);
    expect(() => v.rest().toArray()).toThrow('Cannot perform this action with an infinite size.');
    expect(() => v.butLast().toArray()).toThrow('Cannot perform this action with an infinite size.');
    expect(() => v.toArray()).toThrow('Cannot perform this action with an infinite size.');
  });

  it('backwards range', () => {
    let v = Range(10, 1, 3);
    expect(v.size).toBe(3);
    expect(v.first()).toBe(10);
    expect(v.last()).toBe(4);
    expect(v.toArray()).toEqual([10, 7, 4]);
  });

  it('empty range', () => {
    let v = Range(10, 10);
    expect(v.size).toBe(0);
    expect(v.first()).toBe(undefined);
    expect(v.rest().toArray()).toEqual([]);
    expect(v.last()).toBe(undefined);
    expect(v.butLast().toArray()).toEqual([]);
    expect(v.toArray()).toEqual([]);
  });

  check.it('includes first, excludes last', [gen.int, gen.int], (from, to) => {
    let isIncreasing = to >= from;
    let size = isIncreasing ? to - from : from - to;
    let r = Range(from, to);
    let a = r.toArray();
    expect(r.size).toBe(size);
    expect(a.length).toBe(size);
    expect(r.get(0)).toBe(size ? from : undefined);
    expect(a[0]).toBe(size ? from : undefined);
    let last = to + (isIncreasing ? -1 : 1);
    expect(r.last()).toBe(size ? last : undefined);
    if (size) {
      expect(a[a.length - 1]).toBe(last);
    }
  });

  let shrinkInt = gen.shrink(gen.int);

  check.it('slices the same as array slices', [shrinkInt, shrinkInt, shrinkInt, shrinkInt], (from, to, begin, end) => {
    let r = Range(from, to);
    let a = r.toArray();
    expect(r.slice(begin, end).toArray()).toEqual(a.slice(begin, end));
  });

  it('slices range', () => {
    let v = Range(1, 11, 2);
    let s = v.slice(1, -2);
    expect(s.size).toBe(2);
    expect(s.toArray()).toEqual([3, 5]);
  });

  it('empty slice of range', () => {
    let v = Range(1, 11, 2);
    let s = v.slice(100, 200);
    expect(s.size).toBe(0);
    expect(s.toArray()).toEqual([]);
  });

  it('slices empty range', () => {
    let v = Range(10, 10);
    let s = v.slice(1, -2);
    expect(s.size).toBe(0);
    expect(s.toArray()).toEqual([]);
  });

  it('stepped range does not land on end', () => {
    let v = Range(0, 7, 2);
    expect(v.size).toBe(4);
    expect(v.toArray()).toEqual([0, 2, 4, 6]);
  });

  it('can be float', () => {
    let v = Range(0.5, 2.5, 0.5);
    expect(v.size).toBe(4);
    expect(v.toArray()).toEqual([0.5, 1, 1.5, 2]);
  });

  it('can be negative', () => {
    let v = Range(10, -10, 5);
    expect(v.size).toBe(4);
    expect(v.toArray()).toEqual([10, 5, 0, -5]);
  });

  it('can get from any index in O(1)', () => {
    let v = Range(0, Infinity, 8);
    expect(v.get(111)).toBe(888);
  });

  it('can find an index in O(1)', () => {
    let v = Range(0, Infinity, 8);
    expect(v.indexOf(888)).toBe(111);
  });

  it('maps values', () => {
    let r = Range(0, 4).map(v => v * v);
    expect(r.toArray()).toEqual([0, 1, 4, 9]);
  });

  it('filters values', () => {
    let r = Range(0, 10).filter(v => v % 2 === 0);
    expect(r.toArray()).toEqual([0, 2, 4, 6, 8]);
  });

  it('reduces values', () => {
    let v = Range(0, 10, 2);

    let r = v.reduce<number>((a, b) => a + b, 0);

    expect(r).toEqual(20);
  });

  it('takes and skips values', () => {
    let v = Range(0, 100, 3);

    let r = v.skip(2).take(2);

    expect(r.toArray()).toEqual([6, 9]);
  });

  it('can describe lazy operations', () => {
    expect(
      Range(1, Infinity).map(n => -n).take(5).toArray(),
    ).toEqual(
      [-1, -2, -3, -4, -5],
    );
  });

  it('efficiently chains array methods', () => {
    let v = Range(1, Infinity);

    let r = v
      .filter(x => x % 2 === 0)
      .skip(2)
      .map<number>(x => x * x)
      .take(3)
      .reduce<number>((a, b) => a + b, 0);

    expect(r).toEqual(200);
  });
});
