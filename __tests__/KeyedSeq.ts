/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

import * as jasmineCheck from 'jasmine-check';
jasmineCheck.install();

import { Range, Seq } from 'immutable';

describe('KeyedSeq', () => {
  check.it('it iterates equivalently', [gen.array(gen.int)], (ints) => {
    const seq = Seq(ints);
    const keyed = seq.toKeyedSeq();

    const seqEntries = seq.entries();
    const keyedEntries = keyed.entries();

    let seqStep, keyedStep;
    do {
      seqStep = seqEntries.next();
      keyedStep = keyedEntries.next();
      expect(keyedStep).toEqual(seqStep);
    } while (!seqStep.done);
  });

  it('maintains keys', () => {
    const isEven = (x) => x % 2 === 0;
    const seq = Range(0, 100);

    // This is what we expect for IndexedSequences
    const operated = seq.filter(isEven).skip(10).take(5);
    expect(operated.entrySeq().toArray()).toEqual([
      [0, 20],
      [1, 22],
      [2, 24],
      [3, 26],
      [4, 28],
    ]);

    // Where Keyed Sequences maintain keys.
    const keyed = seq.toKeyedSeq();
    const keyedOperated = keyed.filter(isEven).skip(10).take(5);
    expect(keyedOperated.entrySeq().toArray()).toEqual([
      [20, 20],
      [22, 22],
      [24, 24],
      [26, 26],
      [28, 28],
    ]);
  });

  it('works with reverse', () => {
    const seq = Range(0, 100);

    // This is what we expect for IndexedSequences
    expect(seq.reverse().take(5).entrySeq().toArray()).toEqual([
      [0, 99],
      [1, 98],
      [2, 97],
      [3, 96],
      [4, 95],
    ]);

    // Where Keyed Sequences maintain keys.
    expect(seq.toKeyedSeq().reverse().take(5).entrySeq().toArray()).toEqual([
      [99, 99],
      [98, 98],
      [97, 97],
      [96, 96],
      [95, 95],
    ]);
  });

  it('works with double reverse', () => {
    const seq = Range(0, 100);

    // This is what we expect for IndexedSequences
    expect(
      seq.reverse().skip(10).take(5).reverse().entrySeq().toArray()
    ).toEqual([
      [0, 85],
      [1, 86],
      [2, 87],
      [3, 88],
      [4, 89],
    ]);

    // Where Keyed Sequences maintain keys.
    expect(
      seq.reverse().toKeyedSeq().skip(10).take(5).reverse().entrySeq().toArray()
    ).toEqual([
      [14, 85],
      [13, 86],
      [12, 87],
      [11, 88],
      [10, 89],
    ]);
  });
});
