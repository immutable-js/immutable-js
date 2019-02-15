/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

import * as jasmineCheck from 'jasmine-check';
jasmineCheck.install();

import { Stretch } from '../';

describe('Stretch', () => {
  it('fixed stretch', () => {
    const v = Stretch(5, 3);
    expect(v.size).toBe(3);
    expect(v.first()).toBe(2);
    expect(v.rest().toArray()).toEqual([5, 8]);
    expect(v.last()).toBe(8);
    expect(v.butLast().toArray()).toEqual([2, 5]);
    expect(v.toArray()).toEqual([2, 5, 8]);
  });

  it('ends and front', () => {
    const v = Stretch(5, 3, 4);
    expect(v.size).toBe(3);
    expect(v.first()).toBe(2);
    expect(v.rest().toArray()).toEqual([5, 9]);
    expect(v.last()).toBe(9);
    expect(v.butLast().toArray()).toEqual([2, 5]);
    expect(v.toArray()).toEqual([2, 5, 9]);
  });

  it('slices stretch', () => {
    const v = Stretch(5, 3, 4);
    const s = v.slice(0, 2);
    expect(s.size).toBe(2);
    expect(s.toArray()).toEqual([2, 5]);
  });

  it('one value', () => {
    const v = Stretch(5, 3, 4);
    const s = v.slice(0, 1);
    expect(s.size).toBe(1);
    expect(s.toArray()).toEqual([2]);
  });

  it('maps values', () => {
    const r = Stretch(5, 3).map(v => v * v);
    expect(r.toArray()).toEqual([4, 25, 64]);
  });

  it('reduces values', () => {
    const v = Stretch(5, 3);
    const r = v.reduce<number>((a, b) => a + b, 0);
    expect(r).toEqual(15);
  });

  it('can be float', () => {
    const v = Stretch(3.5, 1.5, 2.5);
    expect(v.size).toBe(3);
    expect(v.toArray()).toEqual([2, 3.5, 6]);
  });

  it('can be negative', () => {
    const v = Stretch(-5, -5, -6);
    expect(v.size).toBe(3);
    expect(v.toArray()).toEqual([0, -5, -11]);
  });
});
