/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { List } = require('../src/Immutable');

const NON_NUMBERS = {
  array: ['not', 'a', 'number'],
  NaN: NaN,
  object: { not: 'a number' },
  string: 'not a number',
};

describe('List', () => {
  describe('setSize()', () => {
    Object.keys(NON_NUMBERS).forEach((type) => {
      const nonNumber = NON_NUMBERS[type];
      it(`considers a size argument of type '${type}' to be zero`, () => {
        const v1 = List.of(1, 2, 3);
        const v2 = v1.setSize(nonNumber);
        expect(v2.size).toBe(0);
      });
    });
  });
  describe('slice()', () => {
    // Mimic the behavior of Array::slice()
    // http://www.ecma-international.org/ecma-262/6.0/#sec-array.prototype.slice
    Object.keys(NON_NUMBERS).forEach((type) => {
      const nonNumber = NON_NUMBERS[type];
      it(`considers a begin argument of type '${type}' to be zero`, () => {
        const v1 = List.of('a', 'b', 'c');
        const v2 = v1.slice(nonNumber, 2);
        expect(v2.size).toBe(2);
        expect(v2.first()).toBe('a');
        expect(v2.rest().size).toBe(1);
        expect(v2.last()).toBe('b');
        expect(v2.butLast().size).toBe(1);
      });
      it(`considers an end argument of type '${type}' to be zero`, () => {
        const v1 = List.of('a', 'b', 'c');
        const v2 = v1.slice(0, nonNumber);
        expect(v2.size).toBe(0);
        expect(v2.first()).toBe(undefined);
        expect(v2.rest().size).toBe(0);
        expect(v2.last()).toBe(undefined);
        expect(v2.butLast().size).toBe(0);
      });
    });
  });
});
