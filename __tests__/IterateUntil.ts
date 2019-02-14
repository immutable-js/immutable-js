/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

import { IterateUntil } from '../';

describe('IterateUntil', () => {
  it('fixed iterateuntil', () => {
    const v = IterateUntil(n => n + 1, a => a < 5);
    expect(v.size).toBe(3);
    expect(v.first()).toBe(2);
    expect(v.rest().toArray()).toEqual([3, 4]);
    expect(v.last()).toBe(4);
    expect(v.butLast().toArray()).toEqual([2, 3]);
    expect(v.toArray()).toEqual([2, 3, 4]);
  });

  it('defined seed', () => {
    const v = IterateUntil(n => n + 1, a => a < 10, 3);
    expect(v.size).toBe(6);
    expect(v.first()).toBe(4);
    expect(v.rest().toArray()).toEqual([5, 6, 7, 8, 9]);
    expect(v.last()).toBe(9);
    expect(v.butLast().toArray()).toEqual([4, 5, 6, 7, 8]);
    expect(v.toArray()).toEqual([4, 5, 6, 7, 8, 9]);
  });
});
