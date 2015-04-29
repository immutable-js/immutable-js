///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

jest.autoMockOff();

import jasmineCheck = require('jasmine-check');
jasmineCheck.install();

import Immutable = require('immutable');
import Stack = Immutable.Stack;

function arrayOfSize(s) {
  var a = new Array(s);
  for (var ii = 0; ii < s; ii++) {
    a[ii] = ii;
  }
  return a;
}

describe('Stack', () => {

  it('constructor provides initial values', () => {
    var s = Stack.of('a', 'b', 'c');
    expect(s.get(0)).toBe('a');
    expect(s.get(1)).toBe('b');
    expect(s.get(2)).toBe('c');
  });

  it('toArray provides a JS array', () => {
    var s = Stack.of('a', 'b', 'c');
    expect(s.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('accepts a JS array', () => {
    var s = Stack(['a', 'b', 'c']);
    expect(s.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('accepts a Seq', () => {
    var seq = Immutable.Seq(['a', 'b', 'c']);
    var s = Stack(seq);
    expect(s.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('accepts a keyed Seq', () => {
    var seq = Immutable.Seq({a:null, b:null, c:null}).flip();
    var s = Stack(seq);
    expect(s.toArray()).toEqual([[null,'a'], [null,'b'], [null,'c']]);
    // Explicit values
    var s2 = Stack(seq.valueSeq());
    expect(s2.toArray()).toEqual(['a', 'b', 'c']);
    // toStack() does this for you.
    var s3 = seq.toStack();
    expect(s3.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('pushing creates a new instance', () => {
    var s0 = Stack.of('a');
    var s1 = s0.push('A');
    expect(s0.get(0)).toBe('a');
    expect(s1.get(0)).toBe('A');
  });

  it('get helpers make for easier to read code', () => {
    var s = Stack.of('a', 'b', 'c');
    expect(s.first()).toBe('a');
    expect(s.last()).toBe('c');
    expect(s.peek()).toBe('a');
  });

  it('slice helpers make for easier to read code', () => {
    var s = Stack.of('a', 'b', 'c');
    expect(s.rest().toArray()).toEqual(['b', 'c']);
  });

  it('iterable', () => {
    var s = Stack.of('a', 'b', 'c');
    expect(s.size).toBe(3);

    var forEachResults = [];
    s.forEach((val, i) => forEachResults.push([i, val]));
    expect(forEachResults).toEqual([
      [0,'a'],
      [1,'b'],
      [2,'c'],
    ]);
    
    // map will cause reverse iterate
    expect(s.map(val => val + val).toArray()).toEqual([
      'aa',
      'bb',
      'cc',
    ]);
    
    var iteratorResults = [];
    var iterator = s.entries();
    var step;
    while (!(step = iterator.next()).done) {
      iteratorResults.push(step.value);
    }
    expect(iteratorResults).toEqual([
      [0,'a'],
      [1,'b'],
      [2,'c'],
    ]);
    
    iteratorResults = [];
    iterator = s.toSeq().reverse().entries();
    while (!(step = iterator.next()).done) {
      iteratorResults.push(step.value);
    }
    expect(iteratorResults).toEqual([
      [0,'c'],
      [1,'b'],
      [2,'a'],
    ]);
  });

  it('push inserts at lowest index', () => {
    var s0 = Stack.of('a', 'b', 'c');
    var s1 = s0.push('d', 'e', 'f');
    expect(s0.size).toBe(3);
    expect(s1.size).toBe(6);
    expect(s1.toArray()).toEqual(['d', 'e', 'f', 'a', 'b', 'c']);
  });

  it('pop removes the lowest index, decrementing size', () => {
    var s = Stack.of('a', 'b', 'c').pop();
    expect(s.peek()).toBe('b');
    expect(s.toArray()).toEqual([ 'b', 'c' ]);
  });

  check.it('shift removes the lowest index, just like array', {maxSize: 2000},
    [gen.posInt], len => {
      var a = arrayOfSize(len);
      var s = Stack(a);

      while (a.length) {
        expect(s.size).toBe(a.length);
        expect(s.toArray()).toEqual(a);
        s = s.shift();
        a.shift();
      }
      expect(s.size).toBe(a.length);
      expect(s.toArray()).toEqual(a);
    }
  );

  check.it('unshift adds the next lowest index, just like array', {maxSize: 2000},
    [gen.posInt], len => {
      var a = [];
      var s = Stack();

      for (var ii = 0; ii < len; ii++) {
        expect(s.size).toBe(a.length);
        expect(s.toArray()).toEqual(a);
        s = s.unshift(ii);
        a.unshift(ii);
      }
      expect(s.size).toBe(a.length);
      expect(s.toArray()).toEqual(a);
    }
  );

  check.it('unshifts multiple values to the front', {maxSize: 2000},
    [gen.posInt, gen.posInt], (size1: Number, size2: Number) => {
      var a1 = arrayOfSize(size1);
      var a2 = arrayOfSize(size2);

      var s1 = Stack(a1);
      var s3 = s1.unshift.apply(s1, a2);

      var a3 = a1.slice();
      a3.unshift.apply(a3, a2);

      expect(s3.size).toEqual(a3.length);
      expect(s3.toArray()).toEqual(a3);
    }
  );

  it('finds values using indexOf', () => {
    var s = Stack.of('a', 'b', 'c', 'b', 'a');
    expect(s.indexOf('b')).toBe(1);
    expect(s.indexOf('c')).toBe(2);
    expect(s.indexOf('d')).toBe(-1);
  });

});
