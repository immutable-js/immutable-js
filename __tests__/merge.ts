import { fromJS, is, List, Map } from '../';

declare function expect(val: any): ExpectWithIs;

interface ExpectWithIs extends Expect {
  is(expected: any): void;
  not: ExpectWithIs;
}

jasmine.addMatchers({
  is() {
    return {
      compare(actual, expected) {
        let passed = is(actual, expected);
        return {
          pass: passed,
          message: 'Expected ' +
          actual +
          (passed ? '' : ' not') +
          ' to equal ' +
          expected,
        };
      },
    };
  },
});

describe('merge', () => {
  it('merges two maps', () => {
    let m1 = Map({ a: 1, b: 2, c: 3 });
    let m2 = Map({ d: 10, b: 20, e: 30 });
    expect(m1.merge(m2)).is(Map({ a: 1, b: 20, c: 3, d: 10, e: 30 }));
  });

  it('can merge in an explicitly undefined value', () => {
    let m1 = Map({ a: 1, b: 2 });
    let m2 = Map({ a: undefined });
    expect(m1.merge(m2)).is(Map({ a: undefined, b: 2 }));
  });

  it('merges two maps with a merge function', () => {
    let m1 = Map({ a: 1, b: 2, c: 3 });
    let m2 = Map({ d: 10, b: 20, e: 30 });
    expect(m1.mergeWith((a, b) => a + b, m2)).is(
      Map({ a: 1, b: 22, c: 3, d: 10, e: 30 }),
    );
  });

  it('provides key as the third argument of merge function', () => {
    let m1 = Map({ id: 'temp', b: 2, c: 3 });
    let m2 = Map({ id: 10, b: 20, e: 30 });
    let add = (a, b) => a + b;
    expect(m1.mergeWith((a, b, key) => key !== 'id' ? add(a, b) : b, m2)).is(
      Map({ id: 10, b: 22, c: 3, e: 30 }),
    );
  });

  it('deep merges two maps', () => {
    let m1 = fromJS({ a: { b: { c: 1, d: 2 } } });
    let m2 = fromJS({ a: { b: { c: 10, e: 20 }, f: 30 }, g: 40 });
    expect(m1.mergeDeep(m2)).is(
      fromJS({ a: { b: { c: 10, d: 2, e: 20 }, f: 30 }, g: 40 }),
    );
  });

  it('deep merge uses is() for return-self optimization', () => {
    let date1 = new Date(1234567890000);
    let date2 = new Date(1234567890000);
    let m = Map().setIn(['a', 'b', 'c'], date1);
    let m2 = m.mergeDeep({ a: { b: { c: date2 } } });
    expect(m2 === m).toBe(true);
  });

  it('deep merges raw JS', () => {
    let m1 = fromJS({ a: { b: { c: 1, d: 2 } } });
    let js = { a: { b: { c: 10, e: 20 }, f: 30 }, g: 40 };
    expect(m1.mergeDeep(js)).is(
      fromJS({ a: { b: { c: 10, d: 2, e: 20 }, f: 30 }, g: 40 }),
    );
  });

  it('deep merges raw JS with a merge function', () => {
    let m1 = fromJS({ a: { b: { c: 1, d: 2 } } });
    let js = { a: { b: { c: 10, e: 20 }, f: 30 }, g: 40 };
    expect(m1.mergeDeepWith((a, b) => a + b, js)).is(
      fromJS({ a: { b: { c: 11, d: 2, e: 20 }, f: 30 }, g: 40 }),
    );
  });

  it('returns self when a deep merges is a no-op', () => {
    let m1 = fromJS({ a: { b: { c: 1, d: 2 } } });
    expect(m1.mergeDeep({ a: { b: { c: 1 } } })).toBe(m1);
  });

  it('returns arg when a deep merges is a no-op', () => {
    let m1 = fromJS({ a: { b: { c: 1, d: 2 } } });
    expect(Map().mergeDeep(m1)).toBe(m1);
  });

  it('can overwrite existing maps', () => {
    expect(
      fromJS({ a: { x: 1, y: 1 }, b: { x: 2, y: 2 } })
        .merge({ a: null, b: { x: 10 } })
        .toJS(),
    ).toEqual({ a: null, b: { x: 10 } });
    expect(
      fromJS({ a: { x: 1, y: 1 }, b: { x: 2, y: 2 } })
        .mergeDeep({ a: null, b: { x: 10 } })
        .toJS(),
    ).toEqual({ a: null, b: { x: 10, y: 2 } });
  });

  it('can overwrite existing maps with objects', () => {
    let m1 = fromJS({ a: { x: 1, y: 1 } }); // deep conversion.
    let m2 = Map({ a: { z: 10 } }); // shallow conversion to Map.

    // raw object simply replaces map.
    expect(m1.merge(m2).get('a')).toEqual({ z: 10 }); // raw object.
    expect(m1.mergeDeep(m2).get('a')).toEqual({ z: 10 }); // raw object.
  });

  it('merges map entries with Vector values', () => {
    expect(fromJS({ a: [1] }).merge({ b: [2] })).is(fromJS({ a: [1], b: [2] }));
    expect(fromJS({ a: [1] }).mergeDeep({ b: [2] })).is(
      fromJS({ a: [1], b: [2] }),
    );
  });

  it('maintains JS values inside immutable collections', () => {
    let m1 = fromJS({ a: { b: [{ imm: 'map' }] } });
    let m2 = m1.mergeDeep(Map({ a: Map({ b: List.of({ plain: 'obj' }) }) }));

    expect(m1.getIn(['a', 'b', 0])).is(Map([['imm', 'map']]));
    expect(m2.getIn(['a', 'b', 0])).toEqual({ plain: 'obj' });
  });
});
