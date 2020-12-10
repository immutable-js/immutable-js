/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

import * as jasmineCheck from 'jasmine-check';
jasmineCheck.install();

import { List, Range, Seq } from 'immutable';

describe('splice', () => {
  it('splices a sequence only removing elements', () => {
    expect(Seq([1, 2, 3]).splice(0, 1).toArray()).toEqual([2, 3]);
    expect(Seq([1, 2, 3]).splice(1, 1).toArray()).toEqual([1, 3]);
    expect(Seq([1, 2, 3]).splice(2, 1).toArray()).toEqual([1, 2]);
    expect(Seq([1, 2, 3]).splice(3, 1).toArray()).toEqual([1, 2, 3]);
  });

  it('splices a list only removing elements', () => {
    expect(List([1, 2, 3]).splice(0, 1).toArray()).toEqual([2, 3]);
    expect(List([1, 2, 3]).splice(1, 1).toArray()).toEqual([1, 3]);
    expect(List([1, 2, 3]).splice(2, 1).toArray()).toEqual([1, 2]);
    expect(List([1, 2, 3]).splice(3, 1).toArray()).toEqual([1, 2, 3]);
  });

  it('splicing by infinity', () => {
    const l = List(['a', 'b', 'c', 'd']);
    expect(l.splice(2, Infinity, 'x').toArray()).toEqual(['a', 'b', 'x']);
    expect(l.splice(Infinity, 2, 'x').toArray()).toEqual([
      'a',
      'b',
      'c',
      'd',
      'x',
    ]);

    const s = List(['a', 'b', 'c', 'd']);
    expect(s.splice(2, Infinity, 'x').toArray()).toEqual(['a', 'b', 'x']);
    expect(s.splice(Infinity, 2, 'x').toArray()).toEqual([
      'a',
      'b',
      'c',
      'd',
      'x',
    ]);
  });

  it('has the same behavior as array splice in known edge cases', () => {
    // arbitrary numbers that sum to 31
    const a = Range(0, 49).toArray();
    const v = List(a);
    a.splice(-18, 0, 0);
    expect(v.splice(-18, 0, 0).toList().toArray()).toEqual(a);
  });

  check.it(
    'has the same behavior as array splice',
    [gen.array(gen.int), gen.array(gen.oneOf([gen.int, gen.undefined]))],
    (values, args) => {
      const v = List(values);
      const a = values.slice(); // clone
      const splicedV = v.splice.apply(v, args); // persistent
      a.splice.apply(a, args); // mutative
      expect(splicedV.toArray()).toEqual(a);
    }
  );
});
