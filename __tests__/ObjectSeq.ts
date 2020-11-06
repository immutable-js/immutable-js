/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

import { Seq } from '../';

describe('ObjectSequence', () => {
  it('maps', () => {
    const i = Seq({ a: 'A', b: 'B', c: 'C' });
    const m = i.map((x) => x + x).toObject();
    expect(m).toEqual({ a: 'AA', b: 'BB', c: 'CC' });
  });

  it('reduces', () => {
    const i = Seq({ a: 'A', b: 'B', c: 'C' });
    const r = i.reduce<string>((acc, x) => acc + x, '');
    expect(r).toEqual('ABC');
  });

  it('extracts keys', () => {
    const i = Seq({ a: 'A', b: 'B', c: 'C' });
    const k = i.keySeq().toArray();
    expect(k).toEqual(['a', 'b', 'c']);
  });

  it('is reversable', () => {
    const i = Seq({ a: 'A', b: 'B', c: 'C' });
    const k = i.reverse().toArray();
    expect(k).toEqual([
      ['c', 'C'],
      ['b', 'B'],
      ['a', 'A'],
    ]);
  });

  it('is double reversable', () => {
    const i = Seq({ a: 'A', b: 'B', c: 'C' });
    const k = i.reverse().reverse().toArray();
    expect(k).toEqual([
      ['a', 'A'],
      ['b', 'B'],
      ['c', 'C'],
    ]);
  });

  it('can be iterated', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const seq = Seq(obj);
    const entries = seq.entries();
    expect(entries.next()).toEqual({ value: ['a', 1], done: false });
    expect(entries.next()).toEqual({ value: ['b', 2], done: false });
    expect(entries.next()).toEqual({ value: ['c', 3], done: false });
    expect(entries.next()).toEqual({ value: undefined, done: true });
  });

  it('cannot be mutated after calling toObject', () => {
    const seq = Seq({ a: 1, b: 2, c: 3 });

    const obj = seq.toObject();
    obj.c = 10;
    const seq2 = Seq(obj);

    expect(seq.get('c')).toEqual(3);
    expect(seq2.get('c')).toEqual(10);
  });
});
