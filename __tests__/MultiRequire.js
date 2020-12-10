/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Immutable1 = require('../src/Immutable');

jest.resetModules();

const Immutable2 = require('../src/Immutable');

describe('MultiRequire', () => {
  it('might require two different instances of Immutable', () => {
    expect(Immutable1).not.toBe(Immutable2);
    expect(Immutable1.Map({ a: 1 }).toJS()).toEqual({ a: 1 });
    expect(Immutable2.Map({ a: 1 }).toJS()).toEqual({ a: 1 });
  });

  it('detects sequences', () => {
    const x = Immutable1.Map({ a: 1 });
    const y = Immutable2.Map({ a: 1 });
    expect(Immutable1.isCollection(y)).toBe(true);
    expect(Immutable2.isCollection(x)).toBe(true);
  });

  it('detects records', () => {
    const R1 = Immutable1.Record({ a: 1 });
    const R2 = Immutable2.Record({ a: 1 });
    expect(Immutable1.Record.isRecord(R2())).toBe(true);
    expect(Immutable2.Record.isRecord(R1())).toBe(true);
  });

  it('converts to JS when inter-nested', () => {
    const deep = Immutable1.Map({
      a: 1,
      b: 2,
      c: Immutable2.Map({
        x: 3,
        y: 4,
        z: Immutable1.Map(),
      }),
    });

    expect(deep.toJS()).toEqual({
      a: 1,
      b: 2,
      c: {
        x: 3,
        y: 4,
        z: {},
      },
    });
  });

  it('compares for equality', () => {
    const x = Immutable1.Map({ a: 1 });
    const y = Immutable2.Map({ a: 1 });
    expect(Immutable1.is(x, y)).toBe(true);
    expect(Immutable2.is(x, y)).toBe(true);
  });

  it('flattens nested values', () => {
    const nested = Immutable1.List(
      Immutable2.List(Immutable1.List(Immutable2.List.of(1, 2)))
    );

    expect(nested.flatten().toJS()).toEqual([1, 2]);
  });

  it('detects types', () => {
    let c1 = Immutable1.Map();
    let c2 = Immutable2.Map();
    expect(Immutable1.Map.isMap(c2)).toBe(true);
    expect(Immutable2.Map.isMap(c1)).toBe(true);

    c1 = Immutable1.OrderedMap();
    c2 = Immutable2.OrderedMap();
    expect(Immutable1.OrderedMap.isOrderedMap(c2)).toBe(true);
    expect(Immutable2.OrderedMap.isOrderedMap(c1)).toBe(true);

    c1 = Immutable1.List();
    c2 = Immutable2.List();
    expect(Immutable1.List.isList(c2)).toBe(true);
    expect(Immutable2.List.isList(c1)).toBe(true);

    c1 = Immutable1.Stack();
    c2 = Immutable2.Stack();
    expect(Immutable1.Stack.isStack(c2)).toBe(true);
    expect(Immutable2.Stack.isStack(c1)).toBe(true);

    c1 = Immutable1.Set();
    c2 = Immutable2.Set();
    expect(Immutable1.Set.isSet(c2)).toBe(true);
    expect(Immutable2.Set.isSet(c1)).toBe(true);
  });
});
