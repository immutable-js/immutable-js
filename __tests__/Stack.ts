/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

import * as jasmineCheck from 'jasmine-check';
jasmineCheck.install();

import { Seq, Stack } from 'immutable';

function arrayOfSize(s) {
  const a = new Array(s);
  for (let ii = 0; ii < s; ii++) {
    a[ii] = ii;
  }
  return a;
}

describe('Stack', () => {
  it('constructor provides initial values', () => {
    const s = Stack.of('a', 'b', 'c');
    expect(s.get(0)).toBe('a');
    expect(s.get(1)).toBe('b');
    expect(s.get(2)).toBe('c');
  });

  it('toArray provides a JS array', () => {
    const s = Stack.of('a', 'b', 'c');
    expect(s.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('accepts a JS array', () => {
    const s = Stack(['a', 'b', 'c']);
    expect(s.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('accepts a Seq', () => {
    const seq = Seq(['a', 'b', 'c']);
    const s = Stack(seq);
    expect(s.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('accepts a keyed Seq', () => {
    const seq = Seq({ a: null, b: null, c: null }).flip();
    const s = Stack(seq);
    expect(s.toArray()).toEqual([
      [null, 'a'],
      [null, 'b'],
      [null, 'c'],
    ]);
    // Explicit values
    const s2 = Stack(seq.valueSeq());
    expect(s2.toArray()).toEqual(['a', 'b', 'c']);
    // toStack() does this for you.
    const s3 = seq.toStack();
    expect(s3.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('pushing creates a new instance', () => {
    const s0 = Stack.of('a');
    const s1 = s0.push('A');
    expect(s0.get(0)).toBe('a');
    expect(s1.get(0)).toBe('A');
  });

  it('get helpers make for easier to read code', () => {
    const s = Stack.of('a', 'b', 'c');
    expect(s.first()).toBe('a');
    expect(s.last()).toBe('c');
    expect(s.peek()).toBe('a');
  });

  it('slice helpers make for easier to read code', () => {
    const s = Stack.of('a', 'b', 'c');
    expect(s.rest().toArray()).toEqual(['b', 'c']);
  });

  it('iterable in reverse order', () => {
    const s = Stack.of('a', 'b', 'c');
    expect(s.size).toBe(3);

    const forEachResults: Array<any> = [];
    s.forEach((val, i) => forEachResults.push([i, val, s.get(i)]));
    expect(forEachResults).toEqual([
      [0, 'a', 'a'],
      [1, 'b', 'b'],
      [2, 'c', 'c'],
    ]);

    // map will cause reverse iterate
    expect(s.map((val) => val + val).toArray()).toEqual(['aa', 'bb', 'cc']);

    let iteratorResults: Array<any> = [];
    let iterator = s.entries();
    let step;
    while (!(step = iterator.next()).done) {
      iteratorResults.push(step.value);
    }
    expect(iteratorResults).toEqual([
      [0, 'a'],
      [1, 'b'],
      [2, 'c'],
    ]);

    iteratorResults = [];
    iterator = s.toSeq().reverse().entries();
    while (!(step = iterator.next()).done) {
      iteratorResults.push(step.value);
    }
    expect(iteratorResults).toEqual([
      [0, 'c'],
      [1, 'b'],
      [2, 'a'],
    ]);
  });

  it('map is called in reverse order but with correct indices', () => {
    const s = Stack(['a', 'b', 'c']);
    const s2 = s.map((v, i, c) => v + i + c.get(i));
    expect(s2.toArray()).toEqual(['a0a', 'b1b', 'c2c']);

    const mappedSeq = s.toSeq().map((v, i, c) => v + i + c.get(i));
    const s3 = Stack(mappedSeq);
    expect(s3.toArray()).toEqual(['a0a', 'b1b', 'c2c']);
  });

  it('push inserts at lowest index', () => {
    const s0 = Stack.of('a', 'b', 'c');
    const s1 = s0.push('d', 'e', 'f');
    expect(s0.size).toBe(3);
    expect(s1.size).toBe(6);
    expect(s1.toArray()).toEqual(['d', 'e', 'f', 'a', 'b', 'c']);
  });

  it('pop removes the lowest index, decrementing size', () => {
    const s = Stack.of('a', 'b', 'c').pop();
    expect(s.peek()).toBe('b');
    expect(s.toArray()).toEqual(['b', 'c']);
  });

  check.it(
    'shift removes the lowest index, just like array',
    { maxSize: 2000 },
    [gen.posInt],
    (len) => {
      const a = arrayOfSize(len);
      let s = Stack(a);

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

  check.it(
    'unshift adds the next lowest index, just like array',
    { maxSize: 2000 },
    [gen.posInt],
    (len) => {
      const a: Array<any> = [];
      let s = Stack();

      for (let ii = 0; ii < len; ii++) {
        expect(s.size).toBe(a.length);
        expect(s.toArray()).toEqual(a);
        s = s.unshift(ii);
        a.unshift(ii);
      }
      expect(s.size).toBe(a.length);
      expect(s.toArray()).toEqual(a);
    }
  );

  check.it(
    'unshifts multiple values to the front',
    { maxSize: 2000 },
    [gen.posInt, gen.posInt],
    (size1: number, size2: number) => {
      const a1 = arrayOfSize(size1);
      const a2 = arrayOfSize(size2);

      const s1 = Stack(a1);
      const s3 = s1.unshift.apply(s1, a2);

      const a3 = a1.slice();
      a3.unshift.apply(a3, a2);

      expect(s3.size).toEqual(a3.length);
      expect(s3.toArray()).toEqual(a3);
    }
  );

  it('finds values using indexOf', () => {
    const s = Stack.of('a', 'b', 'c', 'b', 'a');
    expect(s.indexOf('b')).toBe(1);
    expect(s.indexOf('c')).toBe(2);
    expect(s.indexOf('d')).toBe(-1);
  });

  it('pushes on all items in an iter', () => {
    const abc = Stack(['a', 'b', 'c']);
    const xyz = Stack(['x', 'y', 'z']);
    const xyzSeq = Seq(['x', 'y', 'z']);

    // Push all to the front of the Stack so first item ends up first.
    expect(abc.pushAll(xyz).toArray()).toEqual(['x', 'y', 'z', 'a', 'b', 'c']);
    expect(abc.pushAll(xyzSeq).toArray()).toEqual([
      'x',
      'y',
      'z',
      'a',
      'b',
      'c',
    ]);

    // Pushes Seq contents into Stack
    expect(Stack().pushAll(xyzSeq)).not.toBe(xyzSeq);
    expect(Stack().pushAll(xyzSeq).toArray()).toEqual(['x', 'y', 'z']);

    // Pushing a Stack onto an empty Stack returns === Stack
    expect(Stack().pushAll(xyz)).toBe(xyz);

    // Pushing an empty Stack onto a Stack return === Stack
    expect(abc.pushAll(Stack())).toBe(abc);
  });
});
