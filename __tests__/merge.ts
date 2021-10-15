import {
  fromJS,
  List,
  Map,
  merge,
  mergeDeep,
  mergeDeepWith,
  Record,
  Set,
} from 'immutable';

describe('merge', () => {
  it('merges two maps', () => {
    const m1 = Map({ a: 1, b: 2, c: 3 });
    const m2 = Map({ d: 10, b: 20, e: 30 });
    expect(m1.merge(m2)).toEqual(Map({ a: 1, b: 20, c: 3, d: 10, e: 30 }));
  });

  it('can merge in an explicitly undefined value', () => {
    const m1 = Map({ a: 1, b: 2 });
    const m2 = Map({ a: undefined as any });
    expect(m1.merge(m2)).toEqual(Map({ a: undefined, b: 2 }));
  });

  it('merges two maps with a merge function', () => {
    const m1 = Map<string, number>({ a: 1, b: 2, c: 3 });
    const m2 = Map<string, number>({ d: 10, b: 20, e: 30 });
    expect(m1.mergeWith((a: any, b: any) => a + b, m2)).toEqual(
      Map({ a: 1, b: 22, c: 3, d: 10, e: 30 })
    );
  });

  it('throws typeError without merge function', () => {
    const m1 = Map({ a: 1, b: 2, c: 3 });
    const m2 = Map({ d: 10, b: 20, e: 30 });
    // @ts-expect-error
    expect(() => m1.mergeWith(1, m2)).toThrowError(TypeError);
  });

  it('provides key as the third argument of merge function', () => {
    const m1 = Map<string, string | number>({ id: 'temp', b: 2, c: 3 });
    const m2 = Map<string, number>({ id: 10, b: 20, e: 30 });
    const add = (a: any, b: any) => a + b;
    expect(
      m1.mergeWith((a, b, key) => (key !== 'id' ? add(a, b) : b), m2)
    ).toEqual(Map({ id: 10, b: 22, c: 3, e: 30 }));
  });

  it('deep merges two maps', () => {
    const m1 = fromJS({ a: { b: { c: 1, d: 2 } } }) as Map<string, any>;
    const m2 = fromJS({ a: { b: { c: 10, e: 20 }, f: 30 }, g: 40 });
    expect(m1.mergeDeep(m2)).toEqual(
      fromJS({ a: { b: { c: 10, d: 2, e: 20 }, f: 30 }, g: 40 })
    );
  });

  it('merge uses === for return-self optimization', () => {
    const date1 = new Date(1234567890000);
    // Value equal, but different reference.
    const date2 = new Date(1234567890000);
    const m = Map().set('a', date1);
    expect(m.merge({ a: date2 })).not.toBe(m);
    expect(m.merge({ a: date1 })).toBe(m);
  });

  it('deep merge uses === for return-self optimization', () => {
    const date1 = new Date(1234567890000);
    // Value equal, but different reference.
    const date2 = new Date(1234567890000);
    const m = Map().setIn(['a', 'b', 'c'], date1);
    expect(m.mergeDeep({ a: { b: { c: date2 } } })).not.toBe(m);
    expect(m.mergeDeep({ a: { b: { c: date1 } } })).toBe(m);
  });

  it('deep merges raw JS', () => {
    const m1 = fromJS({ a: { b: { c: 1, d: 2 } } }) as Map<string, any>;
    const js = { a: { b: { c: 10, e: 20 }, f: 30 }, g: 40 };
    expect(m1.mergeDeep(js)).toEqual(
      fromJS({ a: { b: { c: 10, d: 2, e: 20 }, f: 30 }, g: 40 })
    );
  });

  it('deep merges raw JS with a merge function', () => {
    const m1 = fromJS({ a: { b: { c: 1, d: 2 } } }) as Map<string, any>;
    const js = { a: { b: { c: 10, e: 20 }, f: 30 }, g: 40 };
    expect(m1.mergeDeepWith((a: any, b: any) => a + b, js)).toEqual(
      fromJS({ a: { b: { c: 11, d: 2, e: 20 }, f: 30 }, g: 40 })
    );
  });

  it('deep merges raw JS into raw JS with a merge function', () => {
    const js1 = { a: { b: { c: 1, d: 2 } } };
    const js2 = { a: { b: { c: 10, e: 20 }, f: 30 }, g: 40 };
    expect(mergeDeepWith((a: any, b: any) => a + b, js1, js2)).toEqual({
      a: { b: { c: 11, d: 2, e: 20 }, f: 30 },
      g: 40,
    });
  });

  it('deep merges collections into raw JS with a merge function', () => {
    const js = { a: { b: { c: 1, d: 2 } } };
    const m = fromJS({ a: { b: { c: 10, e: 20 }, f: 30 }, g: 40 });
    expect(mergeDeepWith((a: any, b: any) => a + b, js, m)).toEqual({
      a: { b: { c: 11, d: 2, e: 20 }, f: 30 },
      g: 40,
    });
  });

  it('returns self when a deep merges is a no-op', () => {
    const m1 = fromJS({ a: { b: { c: 1, d: 2 } } }) as Map<string, any>;
    expect(m1.mergeDeep({ a: { b: { c: 1 } } })).toBe(m1);
  });

  it('returns arg when a deep merges is a no-op', () => {
    const m1 = fromJS({ a: { b: { c: 1, d: 2 } } });
    expect(Map().mergeDeep(m1)).toBe(m1);
  });

  it('returns self when a deep merges is a no-op on raw JS', () => {
    const m1 = { a: { b: { c: 1, d: 2 } } };
    expect(mergeDeep(m1, { a: { b: { c: 1 } } })).toBe(m1);
  });

  it('can overwrite existing maps', () => {
    expect(
      (
        fromJS({ a: { x: 1, y: 1 }, b: { x: 2, y: 2 } }) as Map<string, any>
      ).merge({
        a: null,
        b: Map({ x: 10 }),
      })
    ).toEqual(fromJS({ a: null, b: { x: 10 } }));
    expect(
      (
        fromJS({ a: { x: 1, y: 1 }, b: { x: 2, y: 2 } }) as Map<string, any>
      ).mergeDeep({
        a: null,
        b: { x: 10 },
      })
    ).toEqual(fromJS({ a: null, b: { x: 10, y: 2 } }));
  });

  it('can overwrite existing maps with objects', () => {
    const m1 = fromJS({ a: { x: 1, y: 1 } }) as Map<string, any>; // deep conversion.
    const m2 = Map({ a: { z: 10 } }); // shallow conversion to Map.

    // Raw object simply replaces map.
    expect(m1.merge(m2).get('a')).toEqual({ z: 10 }); // raw object.
    // However, mergeDeep will merge that value into the inner Map.
    expect(m1.mergeDeep(m2).get('a')).toEqual(Map({ x: 1, y: 1, z: 10 }));
  });

  it('merges map entries with List and Set values', () => {
    const initial = Map({
      a: Map<string, number>({ x: 10, y: 20 }),
      b: List([1, 2, 3]),
      c: Set([1, 2, 3]),
    });
    const additions = Map({
      a: Map<string, number>({ y: 50, z: 100 }),
      b: List([4, 5, 6]),
      c: Set([4, 5, 6]),
    });
    expect(initial.mergeDeep(additions)).toEqual(
      Map({
        a: Map({ x: 10, y: 50, z: 100 }),
        b: List([1, 2, 3, 4, 5, 6]),
        c: Set([1, 2, 3, 4, 5, 6]),
      })
    );
  });

  it('merges map entries with new values', () => {
    const initial = Map({ a: List([1]) });

    // Note: merge and mergeDeep do not deeply coerce values, they only merge
    // with what's there prior.
    expect(initial.merge({ b: [2] } as any)).toEqual(
      Map({ a: List([1]), b: [2] })
    );
    expect(initial.mergeDeep({ b: [2] } as any)).toEqual(
      fromJS(Map({ a: List([1]), b: [2] }))
    );
  });

  it('maintains JS values inside immutable collections', () => {
    const m1 = fromJS({ a: { b: { imm: 'map' } } }) as Map<string, any>;
    const m2 = m1.mergeDeep(Map({ a: Map({ b: { plain: 'obj' } }) }));

    expect(m1.getIn(['a', 'b'])).toEqual(Map([['imm', 'map']]));
    // However mergeDeep will merge that value into the inner Map
    expect(m2.getIn(['a', 'b'])).toEqual(Map({ imm: 'map', plain: 'obj' }));
  });

  it('merges plain Objects', () => {
    expect(merge({ x: 1, y: 1 }, { y: 2, z: 2 }, Map({ z: 3, q: 3 }))).toEqual({
      x: 1,
      y: 2,
      z: 3,
      q: 3,
    });
  });

  it('merges plain Arrays', () => {
    expect(merge([1, 2], [3, 4], List([5, 6]))).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('merging plain Array returns self after no-op', () => {
    const a = [1, 2, 3];
    expect(merge(a, [], [])).toBe(a);
  });

  it('merges records with a size property set to 0', () => {
    const Sizable = Record({ size: 0 });
    expect(Sizable().merge({ size: 123 }).size).toBe(123);
  });

  it('mergeDeep merges partial conflicts', () => {
    const a = fromJS({
      ch: [
        {
          code: 8,
        },
      ],
      banana: 'good',
    }) as Map<unknown, unknown>;
    const b = fromJS({
      ch: {
        code: 8,
      },
      apple: 'anti-doctor',
    });
    expect(
      a.mergeDeep(b).equals(
        fromJS({
          ch: {
            code: 8,
          },
          apple: 'anti-doctor',
          banana: 'good',
        })
      )
    ).toBe(true);
  });

  const map = { type: 'Map', value: Map({ b: 5, c: 9 }) };
  const object = { type: 'object', value: { b: 7, d: 12 } };
  const RecordFactory = Record({ a: 1, b: 2 });
  const record = { type: 'Record', value: RecordFactory({ b: 3 }) };
  const list = { type: 'List', value: List(['5']) };
  const array = { type: 'array', value: ['9'] };
  const set = { type: 'Set', value: Set('3') };

  const incompatibleTypes = [
    [map, list],
    [map, array],
    [map, set],
    [object, list],
    [object, array],
    [object, set],
    [record, list],
    [record, array],
    [record, set],
    [list, set],
  ];

  for (const [
    { type: type1, value: value1 },
    { type: type2, value: value2 },
  ] of incompatibleTypes) {
    it(`mergeDeep and Map#mergeDeep replaces ${type1} and ${type2} with each other`, () => {
      const aObject = { a: value1 };
      const bObject = { a: value2 };
      expect(mergeDeep(aObject, bObject)).toEqual(bObject);
      expect(mergeDeep(bObject, aObject)).toEqual(aObject);

      const aMap = Map({ a: value1 }) as Map<unknown, unknown>;
      const bMap = Map({ a: value2 }) as Map<unknown, unknown>;
      expect(aMap.mergeDeep(bMap).equals(bMap)).toBe(true);
      expect(bMap.mergeDeep(aMap).equals(aMap)).toBe(true);
    });
  }

  const compatibleTypesAndResult = [
    [map, object, Map({ b: 7, c: 9, d: 12 })],
    [map, record, Map({ a: 1, b: 3, c: 9 })],
    [object, map, { b: 5, c: 9, d: 12 }],
    [object, record, { a: 1, b: 3, d: 12 }],
    [record, map, RecordFactory({ b: 5 })],
    [record, object, RecordFactory({ b: 7 })],
    [list, array, List(['5', '9'])],
    [array, list, ['9', '5']],
    [map, { type: 'Map', value: Map({ b: 7 }) }, Map({ b: 7, c: 9 })],
    [object, { type: 'object', value: { d: 3 } }, { b: 7, d: 3 }],
    [
      record,
      { type: 'Record', value: RecordFactory({ a: 3 }) },
      RecordFactory({ a: 3, b: 2 }),
    ],
    [list, { type: 'List', value: List(['12']) }, List(['5', '12'])],
    [array, { type: 'array', value: ['3'] }, ['9', '3']],
    [set, { type: 'Set', value: Set(['3', '5']) }, Set(['3', '5'])],
  ] as const;

  for (const [
    { type: type1, value: value1 },
    { type: type2, value: value2 },
    result,
  ] of compatibleTypesAndResult) {
    it(`mergeDeep and Map#mergeDeep merges ${type1} and ${type2}`, () => {
      const aObject = { a: value1 };
      const bObject = { a: value2 };
      expect(mergeDeep(aObject, bObject)).toEqual({ a: result });

      const aMap = Map({ a: value1 }) as Map<unknown, unknown>;
      const bMap = Map({ a: value2 });
      expect(aMap.mergeDeep(bMap)).toEqual(Map({ a: result }));
    });
  }

  it('Map#mergeDeep replaces nested List with Map and Map with List', () => {
    const a = Map({ a: List([Map({ x: 1 })]) }) as Map<unknown, unknown>;
    const b = Map({ a: Map([[0, Map({ y: 2 })]]) }) as Map<unknown, unknown>;
    expect(a.mergeDeep(b).equals(b)).toBe(true);
    expect(b.mergeDeep(a).equals(a)).toBe(true);
  });

  it('functional mergeDeep replaces nested array with Map', () => {
    const a = { a: [{ x: 1 }] };
    const b = Map({ a: Map([[0, Map({ y: 2 })]]) });
    expect(mergeDeep(a, b)).toEqual({ a: Map([[0, Map({ y: 2 })]]) });
  });
});
