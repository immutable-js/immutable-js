import { describe, expect, it } from '@jest/globals';
import { List, Map, Set, Stack } from 'immutable';
import * as t from 'transducers-js';

describe('Transformer Protocol', () => {
  it('transduces Stack without initial values', () => {
    const s = Stack.of(1, 2, 3, 4);
    const xform = t.comp(
      t.filter((x: number) => x % 2 === 0),
      t.map((x: number) => x + 1)
    );
    // @ts-expect-error: transduce typing issue
    const s2 = t.transduce(xform, Stack(), s);
    expect(s.toArray()).toEqual([1, 2, 3, 4]);
    expect(s2.toArray()).toEqual([5, 3]);
  });

  it('transduces Stack with initial values', () => {
    const v1 = Stack.of(1, 2, 3);
    const v2 = Stack.of(4, 5, 6, 7);
    const xform = t.comp(
      t.filter((x: number) => x % 2 === 0),
      t.map((x: number) => x + 1)
    );
    // @ts-expect-error: transduce typing issue
    const r = t.transduce(xform, Stack(), v1, v2);
    expect(v1.toArray()).toEqual([1, 2, 3]);
    expect(v2.toArray()).toEqual([4, 5, 6, 7]);
    expect(r.toArray()).toEqual([7, 5, 1, 2, 3]);
  });

  it('transduces List without initial values', () => {
    const v = List.of(1, 2, 3, 4);
    const xform = t.comp(
      t.filter((x: number) => x % 2 === 0),
      t.map((x: number) => x + 1)
    );

    // @ts-expect-error: transduce typing issue
    const r = t.transduce(xform, List(), v);
    expect(v.toArray()).toEqual([1, 2, 3, 4]);
    expect(r.toArray()).toEqual([3, 5]);
  });

  it('transduces List with initial values', () => {
    const v1 = List.of(1, 2, 3);
    const v2 = List.of(4, 5, 6, 7);
    const xform = t.comp(
      t.filter((x: number) => x % 2 === 0),
      t.map((x: number) => x + 1)
    );
    // @ts-expect-error: transduce typing issue
    const r = t.transduce(xform, List(), v1, v2);
    expect(v1.toArray()).toEqual([1, 2, 3]);
    expect(v2.toArray()).toEqual([4, 5, 6, 7]);
    expect(r.toArray()).toEqual([1, 2, 3, 5, 7]);
  });

  it('transduces Map without initial values', () => {
    const m1 = Map({ a: 1, b: 2, c: 3, d: 4 });
    const xform = t.comp(
      t.filter(([_k, v]: [string, number]) => v % 2 === 0),
      t.map(([k, v]: [string, number]) => [k, v * 2])
    );
    // @ts-expect-error: transduce typing issue
    const m2 = t.transduce(xform, Map(), m1);
    expect(m1.toObject()).toEqual({ a: 1, b: 2, c: 3, d: 4 });
    expect(m2.toObject()).toEqual({ b: 4, d: 8 });
  });

  it('transduces Map with initial values', () => {
    const m1 = Map({ a: 1, b: 2, c: 3 });
    const m2 = Map({ a: 4, b: 5 });
    const xform = t.comp(
      t.filter(([_k, v]: [string, number]) => v % 2 === 0),
      t.map(([k, v]: [string, number]) => [k, v * 2])
    );
    // @ts-expect-error: transduce typing issue
    const m3 = t.transduce(xform, Map(), m1, m2);
    expect(m1.toObject()).toEqual({ a: 1, b: 2, c: 3 });
    expect(m2.toObject()).toEqual({ a: 4, b: 5 });
    expect(m3.toObject()).toEqual({ a: 8, b: 2, c: 3 });
  });

  it('transduces Set without initial values', () => {
    const s1 = Set.of(1, 2, 3, 4);
    const xform = t.comp(
      t.filter((x: number) => x % 2 === 0),
      t.map((x: number) => x + 1)
    );
    // @ts-expect-error: transduce typing issue
    const s2 = t.transduce(xform, Set(), s1);
    expect(s1.toArray()).toEqual([1, 2, 3, 4]);
    expect(s2.toArray()).toEqual([3, 5]);
  });

  it('transduces Set with initial values', () => {
    const s1 = Set.of(1, 2, 3, 4);
    const s2 = Set.of(2, 3, 4, 5, 6);
    const xform = t.comp(
      t.filter((x: number) => x % 2 === 0),
      t.map((x: number) => x + 1)
    );
    // @ts-expect-error: transduce typing issue
    const s3 = t.transduce(xform, Set(), s1, s2);
    expect(s1.toArray()).toEqual([1, 2, 3, 4]);
    expect(s2.toArray()).toEqual([2, 3, 4, 5, 6]);
    expect(s3.toArray()).toEqual([1, 2, 3, 4, 5, 7]);
  });
});
