/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

import { Times } from '../';

describe('Times', () => {
  it('fixed times', () => {
    const v = Times(5, n => n + 1);
    expect(v.size).toBe(5);
    expect(v.first()).toBe(2);
    expect(v.rest().toArray()).toEqual([3, 4, 5, 6]);
    expect(v.last()).toBe(6);
    expect(v.butLast().toArray()).toEqual([2, 3, 4, 5]);
    expect(v.toArray()).toEqual([2, 3, 4, 5, 6]);
  });

  it('defined seed', () => {
    const v = Times(5, n => n + 1, 2);
    expect(v.size).toBe(5);
    expect(v.first()).toBe(3);
    expect(v.rest().toArray()).toEqual([4, 5, 6, 7]);
    expect(v.last()).toBe(7);
    expect(v.butLast().toArray()).toEqual([3, 4, 5, 6]);
    expect(v.toArray()).toEqual([3, 4, 5, 6, 7]);
  });
});
