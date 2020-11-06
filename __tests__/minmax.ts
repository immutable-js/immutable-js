/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

import * as jasmineCheck from 'jasmine-check';
jasmineCheck.install();

import { is, Seq } from '../';

const genHeterogeneousishArray = gen.oneOf([
  gen.array(gen.oneOf([gen.string, gen.undefined])),
  gen.array(gen.oneOf([gen.int, gen.NaN])),
]);

describe('max', () => {
  it('returns max in a sequence', () => {
    expect(Seq([1, 9, 2, 8, 3, 7, 4, 6, 5]).max()).toBe(9);
  });

  it('accepts a comparator', () => {
    expect(Seq([1, 9, 2, 8, 3, 7, 4, 6, 5]).max((a, b) => b - a)).toBe(1);
  });

  it('by a mapper', () => {
    const family = Seq([
      { name: 'Oakley', age: 7 },
      { name: 'Dakota', age: 7 },
      { name: 'Casey', age: 34 },
      { name: 'Avery', age: 34 },
    ]);
    expect(family.maxBy((p) => p.age)).toBe(family.get(2));
  });

  it('by a mapper and a comparator', () => {
    const family = Seq([
      { name: 'Oakley', age: 7 },
      { name: 'Dakota', age: 7 },
      { name: 'Casey', age: 34 },
      { name: 'Avery', age: 34 },
    ]);
    expect(
      family.maxBy<number>(
        (p) => p.age,
        (a, b) => b - a
      )
    ).toBe(family.get(0));
  });

  it('surfaces NaN, null, and undefined', () => {
    expect(is(NaN, Seq([1, 2, 3, 4, 5, NaN]).max())).toBe(true);
    expect(is(NaN, Seq([NaN, 1, 2, 3, 4, 5]).max())).toBe(true);
    expect(is(null, Seq(['A', 'B', 'C', 'D', null]).max())).toBe(true);
    expect(is(null, Seq([null, 'A', 'B', 'C', 'D']).max())).toBe(true);
  });

  it('null treated as 0 in default iterator', () => {
    expect(is(2, Seq([-1, -2, null, 1, 2]).max())).toBe(true);
  });

  check.it('is not dependent on order', [genHeterogeneousishArray], (vals) => {
    expect(is(Seq(shuffle(vals.slice())).max(), Seq(vals).max())).toEqual(true);
  });
});

describe('min', () => {
  it('returns min in a sequence', () => {
    expect(Seq([1, 9, 2, 8, 3, 7, 4, 6, 5]).min()).toBe(1);
  });

  it('accepts a comparator', () => {
    expect(Seq([1, 9, 2, 8, 3, 7, 4, 6, 5]).min((a, b) => b - a)).toBe(9);
  });

  it('by a mapper', () => {
    const family = Seq([
      { name: 'Oakley', age: 7 },
      { name: 'Dakota', age: 7 },
      { name: 'Casey', age: 34 },
      { name: 'Avery', age: 34 },
    ]);
    expect(family.minBy((p) => p.age)).toBe(family.get(0));
  });

  it('by a mapper and a comparator', () => {
    const family = Seq([
      { name: 'Oakley', age: 7 },
      { name: 'Dakota', age: 7 },
      { name: 'Casey', age: 34 },
      { name: 'Avery', age: 34 },
    ]);
    expect(
      family.minBy<number>(
        (p) => p.age,
        (a, b) => b - a
      )
    ).toBe(family.get(2));
  });

  check.it('is not dependent on order', [genHeterogeneousishArray], (vals) => {
    expect(is(Seq(shuffle(vals.slice())).min(), Seq(vals).min())).toEqual(true);
  });
});

function shuffle(array) {
  let m = array.length;
  let t;
  let i;

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}
