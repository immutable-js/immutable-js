/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

import * as jasmineCheck from 'jasmine-check';
jasmineCheck.install();

import { hash } from 'immutable';

describe('hash', () => {
  it('stable hash of well known values', () => {
    expect(hash(true)).toBe(0x42108421);
    expect(hash(false)).toBe(0x42108420);
    expect(hash(0)).toBe(0);
    expect(hash(null)).toBe(0x42108422);
    expect(hash(undefined)).toBe(0x42108423);
    expect(hash('a')).toBe(97);
    expect(hash('immutable-js')).toBe(510203252);
    expect(hash(123)).toBe(123);
  });

  it('generates different hashes for decimal values', () => {
    expect(hash(123.456)).toBe(884763256);
    expect(hash(123.4567)).toBe(887769707);
  });

  it('generates different hashes for different objects', () => {
    const objA = {};
    const objB = {};
    expect(hash(objA)).toBe(hash(objA));
    expect(hash(objA)).not.toBe(hash(objB));
  });

  it('generates different hashes for different symbols', () => {
    const symA = Symbol();
    const symB = Symbol();
    expect(hash(symA)).toBe(hash(symA));
    expect(hash(symA)).not.toBe(hash(symB));
  });

  it('generates different hashes for different functions', () => {
    const funA = () => {
      return;
    };
    const funB = () => {
      return;
    };
    expect(hash(funA)).toBe(hash(funA));
    expect(hash(funA)).not.toBe(hash(funB));
  });

  const genValue = gen.oneOf([gen.string, gen.int]);

  check.it('generates unsigned 31-bit integers', [genValue], (value) => {
    const hashVal = hash(value);
    expect(Number.isInteger(hashVal)).toBe(true);
    expect(hashVal).toBeGreaterThan(-Math.pow(2, 31));
    expect(hashVal).toBeLessThan(Math.pow(2, 31));
  });
});
