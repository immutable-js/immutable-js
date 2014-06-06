jest.dontMock('../Range.js');
jest.dontMock('../Iterator.js');
var Range = require('../Range.js').Range;

describe('Range', function() {

  it('fixed range', function() {
    var v = Range(0, 3);
    expect(v.length).toBe(3);
    expect(v.first()).toBe(0);
    expect(v.last()).toBe(2);
    expect(v.toArray()).toEqual([0,1,2]);
  });

  it('stepped range', function() {
    var v = Range(1, 10, 3);
    expect(v.length).toBe(3);
    expect(v.first()).toBe(1);
    expect(v.last()).toBe(7);
    expect(v.toArray()).toEqual([1,4,7]);
  });

  it('open range', function() {
    var v = Range(10);
    expect(v.length).toBe(Number.POSITIVE_INFINITY);
    expect(v.first()).toBe(10);
    expect(v.last()).toBe(Number.POSITIVE_INFINITY);
    expect(function() { v.toArray() }).toThrow('Cannot convert infinite list to array');
  });

  it('infinitely repeated range', function() {
    var v = Range(10, 10, 0);
    expect(v.length).toBe(Number.POSITIVE_INFINITY);
    expect(v.first()).toBe(10);
    expect(v.last()).toBe(10);
    expect(function() { v.toArray() }).toThrow('Cannot convert infinite list to array');
  });

  it('backwards range', function() {
    var v = Range(10, 1, 3);
    expect(v.length).toBe(3);
    expect(v.first()).toBe(10);
    expect(v.last()).toBe(4);
    expect(v.toArray()).toEqual([10,7,4]);
  });

  it('empty range', function() {
    var v = Range(10, 10);
    expect(v.length).toBe(0);
    expect(v.first()).toBe(undefined);
    expect(v.last()).toBe(undefined);
    expect(v.toArray()).toEqual([]);
  });

  it('slices range', function() {
    var v = Range(1, 11, 2);
    var s = v.slice(1, -2);
    expect(s.length).toBe(2);
    expect(s.toArray()).toEqual([3,5]);
  });

  it('stepped range does not land on end', function() {
    var v = Range(0, 7, 2);
    expect(v.length).toBe(4);
    expect(v.toArray()).toEqual([0,2,4,6]);
  });

  it('can be float', function() {
    var v = Range(0.5, 2.5, 0.5);
    expect(v.length).toBe(4);
    expect(v.toArray()).toEqual([0.5, 1, 1.5, 2]);
  });

  it('can be negative', function() {
    var v = Range(10, -10, 5);
    expect(v.length).toBe(4);
    expect(v.toArray()).toEqual([10,5,0,-5]);
  });

  it('can get from any index in O(1)', function() {
    var v = Range(0, Number.POSITIVE_INFINITY, 8);
    expect(v.get(111)).toBe(888);
  });

//  it('finds values using indexOf', function() {
//    var v = PVector('a', 'b', 'c', 'b', 'a');
//    expect(v.indexOf('b')).toBe(1);
//    expect(v.indexOf('c')).toBe(2);
//    expect(v.indexOf('d')).toBe(-1);
//  });
//
//  it('finds values using findIndex', function() {
//    var v = PVector('a', 'b', 'c', 'B', 'a');
//    expect(v.findIndex(function(value) {
//      return value.toUpperCase() === value;
//    })).toBe(3);
//  });

  it('maps values', function() {
    var r = Range(0, 4).map(function(v){return v*v});
    expect(r.toArray()).toEqual([0,1,4,9]);
  });

  it('filters values', function() {
    var r = Range(0, 10).filter(function(v){return v%2==0});
    expect(r.toArray()).toEqual([0,2,4,6,8]);
  });

  it('reduces values', function() {
    var v = Range(0, 10, 2);

    var r = v.reduce(function (a, b) {
      return a + b
    }, 0);

    expect(r).toEqual(20);
  });

  it('takes and skips values', function() {
    var v = Range(0, 100, 3)

    var r = v.skip(2).take(2);

    expect(r.toArray()).toEqual([6, 9]);
  });

  it('efficiently chains array methods', function() {
    var v = Range(1, Infinity);

    var r = v
      .filter(function(x) { return x % 2 == 0 })
      .skip(2)
      .map(function(x) { return x * x })
      .take(3)
      .reduce(function(a, b) { return a + b }, 0);

    expect(r).toEqual(200);
  });

});
