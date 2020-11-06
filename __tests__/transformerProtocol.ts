/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

import * as jasmineCheck from 'jasmine-check';
import * as t from 'transducers-js';
jasmineCheck.install();

import { List, Map, Set, Stack } from '../';

describe('Transformer Protocol', () => {
  it('transduces Stack without initial values', () => {
    const s = Stack.of(1, 2, 3, 4);
    const xform = t.comp(
      t.filter((x) => x % 2 === 0),
      t.map((x) => x + 1)
    );
    const s2 = t.transduce(xform, Stack(), s);
    expect(s.toArray()).toEqual([1, 2, 3, 4]);
    expect(s2.toArray()).toEqual([5, 3]);
  });

  it('transduces Stack with initial values', () => {
    const v1 = Stack.of(1, 2, 3);
    const v2 = Stack.of(4, 5, 6, 7);
    const xform = t.comp(
      t.filter((x) => x % 2 === 0),
      t.map((x) => x + 1)
    );
    const r = t.transduce(xform, Stack(), v1, v2);
    expect(v1.toArray()).toEqual([1, 2, 3]);
    expect(v2.toArray()).toEqual([4, 5, 6, 7]);
    expect(r.toArray()).toEqual([7, 5, 1, 2, 3]);
  });

  it('transduces List without initial values', () => {
    const v = List.of(1, 2, 3, 4);
    const xform = t.comp(
      t.filter((x) => x % 2 === 0),
      t.map((x) => x + 1)
    );
    const r = t.transduce(xform, List(), v);
    expect(v.toArray()).toEqual([1, 2, 3, 4]);
    expect(r.toArray()).toEqual([3, 5]);
  });

  it('transduces List with initial values', () => {
    const v1 = List.of(1, 2, 3);
    const v2 = List.of(4, 5, 6, 7);
    const xform = t.comp(
      t.filter((x) => x % 2 === 0),
      t.map((x) => x + 1)
    );
    const r = t.transduce(xform, List(), v1, v2);
    expect(v1.toArray()).toEqual([1, 2, 3]);
    expect(v2.toArray()).toEqual([4, 5, 6, 7]);
    expect(r.toArray()).toEqual([1, 2, 3, 5, 7]);
  });

  it('transduces Map without initial values', () => {
    const m1 = Map({ a: 1, b: 2, c: 3, d: 4 });
    const xform = t.comp(
      t.filter(([k, v]) => v % 2 === 0),
      t.map(([k, v]) => [k, v * 2])
    );
    const m2 = t.transduce(xform, Map(), m1);
    expect(m1.toObject()).toEqual({ a: 1, b: 2, c: 3, d: 4 });
    expect(m2.toObject()).toEqual({ b: 4, d: 8 });
  });

  it('transduces Map with initial values', () => {
    const m1 = Map({ a: 1, b: 2, c: 3 });
    const m2 = Map({ a: 4, b: 5 });
    const xform = t.comp(
      t.filter(([k, v]) => v % 2 === 0),
      t.map(([k, v]) => [k, v * 2])
    );
    const m3 = t.transduce(xform, Map(), m1, m2);
    expect(m1.toObject()).toEqual({ a: 1, b: 2, c: 3 });
    expect(m2.toObject()).toEqual({ a: 4, b: 5 });
    expect(m3.toObject()).toEqual({ a: 8, b: 2, c: 3 });
  });

  it('transduces Set without initial values', () => {
    const s1 = Set.of(1, 2, 3, 4);
    const xform = t.comp(
      t.filter((x) => x % 2 === 0),
      t.map((x) => x + 1)
    );
    const s2 = t.transduce(xform, Set(), s1);
    expect(s1.toArray()).toEqual([1, 2, 3, 4]);
    expect(s2.toArray()).toEqual([3, 5]);
  });

  it('transduces Set with initial values', () => {
    const s1 = Set.of(1, 2, 3, 4);
    const s2 = Set.of(2, 3, 4, 5, 6);
    const xform = t.comp(
      t.filter((x) => x % 2 === 0),
      t.map((x) => x + 1)
    );
    const s3 = t.transduce(xform, Set(), s1, s2);
    expect(s1.toArray()).toEqual([1, 2, 3, 4]);
    expect(s2.toArray()).toEqual([2, 3, 4, 5, 6]);
    expect(s3.toArray()).toEqual([1, 2, 3, 4, 5, 7]);
  });
});
