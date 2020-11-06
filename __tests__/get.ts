/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

import { Range } from '../';

describe('get', () => {
  it('gets any index', () => {
    const seq = Range(0, 100);
    expect(seq.get(20)).toBe(20);
  });

  it('gets first', () => {
    const seq = Range(0, 100);
    expect(seq.first()).toBe(0);
  });

  it('gets last', () => {
    const seq = Range(0, 100);
    expect(seq.last()).toBe(99);
  });

  it('gets any index after reversing', () => {
    const seq = Range(0, 100).reverse();
    expect(seq.get(20)).toBe(79);
  });

  it('gets first after reversing', () => {
    const seq = Range(0, 100).reverse();
    expect(seq.first()).toBe(99);
  });

  it('gets last after reversing', () => {
    const seq = Range(0, 100).reverse();
    expect(seq.last()).toBe(0);
  });

  it('gets any index when size is unknown', () => {
    const seq = Range(0, 100).filter((x) => x % 2 === 1);
    expect(seq.get(20)).toBe(41);
  });

  it('gets first when size is unknown', () => {
    const seq = Range(0, 100).filter((x) => x % 2 === 1);
    expect(seq.first()).toBe(1);
  });

  it('gets last when size is unknown', () => {
    const seq = Range(0, 100).filter((x) => x % 2 === 1);
    expect(seq.last()).toBe(99); // Note: this is O(N)
  });
});
